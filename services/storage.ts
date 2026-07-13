import * as FileSystem from 'expo-file-system/legacy';
import * as SecureStore from 'expo-secure-store';

import {
  createPasswordSalt,
  EncryptedPayload,
  hashPasswordVerifier,
} from '@/services/encryption';
import {
  clearSessionVaultCrypto,
  decryptVaultJson,
  encryptVaultJson,
  primeSessionVaultCrypto,
} from '@/services/sessionCrypto';
import {
  readCustomTemplatesPayload,
  readNotesPayload,
  signVaultBundle,
} from '@/services/vaultBundle';
import { base64ToBytes, bytesToBase64 } from '@/utils/base64';

const VERIFIER_KEY = 'totus_master_verifier';
const SALT_KEY = 'totus_master_salt';
const VAULT_DIR = `${FileSystem.documentDirectory}vault/`;
const VAULT_FILE = `${VAULT_DIR}notes.enc`;

export interface EncryptedAttachment {
  id: string;
  type: 'photo' | 'audio' | 'video' | 'voice_memo';
  filename: string;
  mimeType: string;
  encryptedPath: string;
  createdAt: string;
  /** Gallery asset id if imported from library — used for scrub tracking. */
  sourceAssetId?: string | null;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  templateId?: string;
  customTemplateId?: string;
  formData?: Record<string, string>;
  createdAt: string;
  updatedAt: string;
  isFlagged?: boolean;
  reminderAt?: string | null;
  extraNotes?: string;
  attachments?: EncryptedAttachment[];
  notePasswordEnabled?: boolean;
  followUpStatus?: 'open' | 'done';
}

export interface VaultData {
  v: number;
  notes: Note[];
}

function normalizeVault(raw: Partial<VaultData> | { notes: Note[] }): VaultData {
  const version = 'v' in raw && raw.v != null ? raw.v : 2;
  return {
    v: version,
    notes: (raw.notes ?? []).map((note) => ({
      ...note,
      isFlagged: note.isFlagged ?? false,
      reminderAt: note.reminderAt ?? null,
      extraNotes: note.extraNotes ?? '',
      attachments: note.attachments ?? [],
      notePasswordEnabled: note.notePasswordEnabled ?? false,
      followUpStatus: note.followUpStatus ?? 'open',
      formData: note.formData ?? undefined,
    })),
  };
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
  await clearSessionVaultCrypto();
  await saveVault(vault, newPassword);
  return true;
}

async function ensureVaultDir(): Promise<void> {
  const info = await FileSystem.getInfoAsync(VAULT_DIR);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(VAULT_DIR, { intermediates: true });
  }
}

async function readVaultPayload(): Promise<EncryptedPayload | null> {
  await ensureVaultDir();
  const info = await FileSystem.getInfoAsync(VAULT_FILE);
  if (!info.exists) {
    return null;
  }
  const json = await FileSystem.readAsStringAsync(VAULT_FILE);
  return JSON.parse(json) as EncryptedPayload;
}

export async function loadVault(password: string): Promise<VaultData> {
  const payload = await readVaultPayload();
  if (!payload) {
    return normalizeVault({ notes: [] });
  }

  await primeSessionVaultCrypto(password, payload);
  const plaintext = await decryptVaultJson(payload, password);
  return normalizeVault(JSON.parse(plaintext) as Partial<VaultData>);
}

export async function saveVault(vault: VaultData, password: string): Promise<void> {
  await ensureVaultDir();
  const normalized = normalizeVault(vault);
  const plaintext = JSON.stringify(normalized);
  const payload = await encryptVaultJson(plaintext, password);
  await FileSystem.writeAsStringAsync(VAULT_FILE, JSON.stringify(payload));
}

export async function exportVaultFile(password: string): Promise<string> {
  await ensureVaultDir();
  const info = await FileSystem.getInfoAsync(VAULT_FILE);
  const exportPath = `${FileSystem.cacheDirectory}totus_secure_notes.enc`;

  if (!info.exists) {
    const payload = await encryptVaultJson(JSON.stringify(normalizeVault({ notes: [] })), password);
    await FileSystem.writeAsStringAsync(exportPath, JSON.stringify(payload));
    return exportPath;
  }

  await FileSystem.copyAsync({ from: VAULT_FILE, to: exportPath });
  return exportPath;
}

export async function exportFullVaultBundle(password: string): Promise<string> {
  await ensureVaultDir();
  const notesPayload =
    (await readNotesPayload()) ??
    (await encryptVaultJson(JSON.stringify(normalizeVault({ notes: [] })), password));
  const customTemplatesPayload = await readCustomTemplatesPayload();

  const bundleBody = {
    v: 2 as const,
    notes: notesPayload,
    customTemplates: customTemplatesPayload,
    exportedAt: new Date().toISOString(),
  };
  const bundle = await signVaultBundle(bundleBody, password);

  const exportPath = `${FileSystem.cacheDirectory}totus_vault_bundle.totus`;
  await FileSystem.writeAsStringAsync(exportPath, JSON.stringify(bundle, null, 2));
  return exportPath;
}

export async function importVaultFile(uri: string, password: string): Promise<VaultData> {
  const json = await FileSystem.readAsStringAsync(uri);
  const payload = JSON.parse(json) as EncryptedPayload;
  await clearSessionVaultCrypto();
  await primeSessionVaultCrypto(password, payload);
  const plaintext = await decryptVaultJson(payload, password);
  const vault = normalizeVault(JSON.parse(plaintext) as Partial<VaultData>);
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
    isFlagged: false,
    reminderAt: null,
    extraNotes: '',
    attachments: [],
    notePasswordEnabled: false,
    followUpStatus: 'open',
  };
}

export function getVaultAttachmentsDir(): string {
  return `${VAULT_DIR}attachments/`;
}
