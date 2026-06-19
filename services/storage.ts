import * as FileSystem from 'expo-file-system/legacy';
import * as SecureStore from 'expo-secure-store';

import {
  createPasswordSalt,
  decryptData,
  encryptData,
  EncryptedPayload,
  hashPasswordVerifier,
} from '@/services/encryption';
import { base64ToBytes, bytesToBase64 } from '@/utils/base64';

const VERIFIER_KEY = 'totus_master_verifier';
const SALT_KEY = 'totus_master_salt';
const VAULT_DIR = `${FileSystem.documentDirectory}vault/`;
const VAULT_FILE = `${VAULT_DIR}notes.enc`;

export interface Note {
  id: string;
  title: string;
  content: string;
  templateId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface VaultData {
  notes: Note[];
}

export async function hasMasterPassword(): Promise<boolean> {
  const verifier = await SecureStore.getItemAsync(VERIFIER_KEY);
  return verifier != null;
}

export async function setMasterPassword(password: string): Promise<void> {
  const salt = await createPasswordSalt();
  const verifier = await hashPasswordVerifier(password, salt);
  await SecureStore.setItemAsync(SALT_KEY, bytesToBase64(salt));
  await SecureStore.setItemAsync(VERIFIER_KEY, verifier);
}

export async function verifyMasterPassword(password: string): Promise<boolean> {
  const saltB64 = await SecureStore.getItemAsync(SALT_KEY);
  const storedVerifier = await SecureStore.getItemAsync(VERIFIER_KEY);
  if (!saltB64 || !storedVerifier) {
    return false;
  }

  const salt = base64ToBytes(saltB64);
  const verifier = await hashPasswordVerifier(password, salt);
  return verifier === storedVerifier;
}

export async function changeMasterPassword(
  currentPassword: string,
  newPassword: string,
  sessionPassword: string,
): Promise<boolean> {
  const valid = await verifyMasterPassword(currentPassword);
  if (!valid) {
    return false;
  }

  const vault = await loadVault(sessionPassword);
  await setMasterPassword(newPassword);
  await saveVault(vault, newPassword);
  return true;
}

async function ensureVaultDir(): Promise<void> {
  const info = await FileSystem.getInfoAsync(VAULT_DIR);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(VAULT_DIR, { intermediates: true });
  }
}

export async function loadVault(password: string): Promise<VaultData> {
  await ensureVaultDir();
  const info = await FileSystem.getInfoAsync(VAULT_FILE);
  if (!info.exists) {
    return { notes: [] };
  }

  const json = await FileSystem.readAsStringAsync(VAULT_FILE);
  const payload = JSON.parse(json) as EncryptedPayload;
  const plaintext = await decryptData(payload, password);
  return JSON.parse(plaintext) as VaultData;
}

export async function saveVault(vault: VaultData, password: string): Promise<void> {
  await ensureVaultDir();
  const plaintext = JSON.stringify(vault);
  const payload = await encryptData(plaintext, password);
  await FileSystem.writeAsStringAsync(VAULT_FILE, JSON.stringify(payload));
}

export async function exportVaultFile(password: string): Promise<string> {
  await ensureVaultDir();
  const info = await FileSystem.getInfoAsync(VAULT_FILE);
  if (!info.exists) {
    const payload = await encryptData(JSON.stringify({ notes: [] }), password);
    const exportPath = `${FileSystem.cacheDirectory}totus_secure_notes.enc`;
    await FileSystem.writeAsStringAsync(exportPath, JSON.stringify(payload));
    return exportPath;
  }

  const exportPath = `${FileSystem.cacheDirectory}totus_secure_notes.enc`;
  await FileSystem.copyAsync({ from: VAULT_FILE, to: exportPath });
  return exportPath;
}

export async function importVaultFile(uri: string, password: string): Promise<VaultData> {
  const json = await FileSystem.readAsStringAsync(uri);
  const payload = JSON.parse(json) as EncryptedPayload;
  const plaintext = await decryptData(payload, password);
  const vault = JSON.parse(plaintext) as VaultData;
  await saveVault(vault, password);
  return vault;
}

export function createNoteId(): string {
  return `note_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export function createEmptyNote(title = 'Untitled Note', content = '', templateId?: string): Note {
  const now = new Date().toISOString();
  return {
    id: createNoteId(),
    title,
    content,
    templateId,
    createdAt: now,
    updatedAt: now,
  };
}
