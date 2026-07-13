import {
  decryptPayload,
  EncryptedPayload,
} from '@/services/encryption';

import {
  parseVaultBundle,
  TotusVaultBundle,
  verifyVaultBundleIntegrity,
} from './vaultBundle';
import { CustomTemplatesVault } from '@/store/customTemplateSchema';
import { VaultData } from './storage';

export interface DecryptedVaultBundle {
  notes: VaultData;
  customTemplates: CustomTemplatesVault | null;
}

async function decryptPayloadJson<T>(payload: EncryptedPayload, password: string): Promise<T> {
  const { plaintext } = await decryptPayload(payload, password);
  return JSON.parse(plaintext) as T;
}

export async function decryptVaultBundle(
  bundleJson: string,
  password: string,
): Promise<DecryptedVaultBundle> {
  const bundle = parseVaultBundle(bundleJson);
  const integrityOk = await verifyVaultBundleIntegrity(bundle, password);
  if (!integrityOk) {
    throw new Error('Vault bundle integrity check failed. The file may have been tampered with.');
  }

  const notes = await decryptPayloadJson<VaultData>(bundle.notes, password);
  let customTemplates: CustomTemplatesVault | null = null;
  if (bundle.customTemplates) {
    customTemplates = await decryptPayloadJson<CustomTemplatesVault>(
      bundle.customTemplates,
      password,
    );
  }
  return { notes, customTemplates };
}

export type { TotusVaultBundle };
