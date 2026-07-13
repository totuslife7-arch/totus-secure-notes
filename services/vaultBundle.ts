import * as FileSystem from 'expo-file-system/legacy';

import { EncryptedPayload, computeBundleHmac } from '@/services/encryption';

export interface BundleIntegrity {
  alg: 'sha256-hmac';
  hmac: string;
}

export interface TotusVaultBundle {
  v: 1 | 2;
  notes: EncryptedPayload;
  customTemplates: EncryptedPayload | null;
  exportedAt: string;
  integrity?: BundleIntegrity;
}

const TEMPLATES_FILE = `${FileSystem.documentDirectory}vault/customTemplates.enc`;
const VAULT_FILE = `${FileSystem.documentDirectory}vault/notes.enc`;

export async function readNotesPayload(): Promise<EncryptedPayload | null> {
  const info = await FileSystem.getInfoAsync(VAULT_FILE);
  if (!info.exists) return null;
  const json = await FileSystem.readAsStringAsync(VAULT_FILE);
  return JSON.parse(json) as EncryptedPayload;
}

export async function readCustomTemplatesPayload(): Promise<EncryptedPayload | null> {
  const info = await FileSystem.getInfoAsync(TEMPLATES_FILE);
  if (!info.exists) return null;
  const json = await FileSystem.readAsStringAsync(TEMPLATES_FILE);
  return JSON.parse(json) as EncryptedPayload;
}

export function parseVaultBundle(json: string): TotusVaultBundle {
  const data = JSON.parse(json) as TotusVaultBundle;
  if ((data.v !== 1 && data.v !== 2) || !data.notes) {
    throw new Error('Invalid Totus vault bundle.');
  }
  return data;
}

export function bundleBodyWithoutIntegrity(bundle: TotusVaultBundle): Omit<TotusVaultBundle, 'integrity'> {
  const { integrity: _integrity, ...body } = bundle;
  return body;
}

export async function signVaultBundle(
  bundle: Omit<TotusVaultBundle, 'integrity'>,
  password: string,
): Promise<TotusVaultBundle> {
  const contentJson = JSON.stringify(bundle);
  const hmacTag = await computeBundleHmac(contentJson, password);
  return {
    ...bundle,
    v: 2,
    integrity: { alg: 'sha256-hmac', hmac: hmacTag },
  };
}

export async function verifyVaultBundleIntegrity(
  bundle: TotusVaultBundle,
  password: string,
): Promise<boolean> {
  if (!bundle.integrity?.hmac) {
    return true;
  }
  const body = bundleBodyWithoutIntegrity(bundle);
  const contentJson = JSON.stringify(body);
  const expected = bundle.integrity.hmac;
  const computed = await computeBundleHmac(contentJson, password);
  return computed === expected;
}
