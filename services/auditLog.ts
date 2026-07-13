import * as FileSystem from 'expo-file-system/legacy';

import * as SecureStore from 'expo-secure-store';



import { getAuditMaxEntries } from '@/services/securitySettings';

import { encryptVaultJson } from '@/services/sessionCrypto';



const AUDIT_DIR = `${FileSystem.documentDirectory}vault/`;

const AUDIT_FILE = `${AUDIT_DIR}audit.log.enc`;

const PENDING_AUDIT_KEY = 'totus_pending_audit_events';



export type AuditEventType =

  | 'vault_unlock'

  | 'vault_lock'

  | 'vault_unlock_failed'

  | 'note_save'

  | 'note_delete'

  | 'note_export'

  | 'vault_export'

  | 'vault_bundle_export'

  | 'vault_import'

  | 'attachment_add'
  | 'attachment_delete'
  | 'attachment_view'

  | 'auto_lock'

  | 'clipboard_copy'

  | 'template_save'

  | 'biometric_success'

  | 'biometric_fail'

  | 'policy_view';



export interface AuditEntry {

  id: string;

  type: AuditEventType;

  timestamp: string;

  detail?: string;

}



interface PendingAuditEntry {

  type: AuditEventType;

  timestamp: string;

  detail?: string;

}



async function ensureAuditDir(): Promise<void> {

  const info = await FileSystem.getInfoAsync(AUDIT_DIR);

  if (!info.exists) {

    await FileSystem.makeDirectoryAsync(AUDIT_DIR, { intermediates: true });

  }

}



async function readEntries(password: string): Promise<AuditEntry[]> {

  await ensureAuditDir();

  const info = await FileSystem.getInfoAsync(AUDIT_FILE);

  if (!info.exists) {

    return [];

  }



  try {

    const json = await FileSystem.readAsStringAsync(AUDIT_FILE);

    const payload = JSON.parse(json);

    const plaintext = await decryptAuditPayload(payload, password);

    return JSON.parse(plaintext) as AuditEntry[];

  } catch {

    return [];

  }

}



async function decryptAuditPayload(payload: unknown, password: string): Promise<string> {

  const { decryptVaultJson } = await import('@/services/sessionCrypto');

  return decryptVaultJson(payload as Parameters<typeof decryptVaultJson>[0], password);

}



async function readPendingEvents(): Promise<PendingAuditEntry[]> {

  const raw = await SecureStore.getItemAsync(PENDING_AUDIT_KEY);

  if (!raw) {

    return [];

  }

  try {

    return JSON.parse(raw) as PendingAuditEntry[];

  } catch {

    return [];

  }

}



async function writePendingEvents(events: PendingAuditEntry[]): Promise<void> {

  if (events.length === 0) {

    await SecureStore.deleteItemAsync(PENDING_AUDIT_KEY);

    return;

  }

  await SecureStore.setItemAsync(PENDING_AUDIT_KEY, JSON.stringify(events.slice(-50)));

}



/** Events recorded while vault is locked (e.g. failed unlock) — merged on next unlock. */

export async function recordPendingAuditEvent(

  type: AuditEventType,

  detail?: string,

): Promise<void> {

  const pending = await readPendingEvents();

  pending.push({ type, timestamp: new Date().toISOString(), detail });

  await writePendingEvents(pending);

}



export async function flushPendingAuditEvents(password: string): Promise<void> {

  const pending = await readPendingEvents();

  if (pending.length === 0) {

    return;

  }

  for (const event of pending) {

    await appendAuditEvent(password, event.type, event.detail);

  }

  await writePendingEvents([]);

}



async function persistEntries(password: string, entries: AuditEntry[]): Promise<void> {

  const maxEntries = await getAuditMaxEntries();

  const trimmed = entries.slice(-maxEntries);

  await ensureAuditDir();

  const payload = await encryptVaultJson(JSON.stringify(trimmed), password);

  await FileSystem.writeAsStringAsync(AUDIT_FILE, JSON.stringify(payload));

}



export async function appendAuditEvent(

  password: string,

  type: AuditEventType,

  detail?: string,

): Promise<void> {

  const entries = await readEntries(password);

  const entry: AuditEntry = {

    id: `audit_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,

    type,

    timestamp: new Date().toISOString(),

    detail,

  };

  entries.push(entry);

  await persistEntries(password, entries);

}



export async function getRecentAuditEvents(

  password: string,

  limit = 50,

): Promise<AuditEntry[]> {

  const entries = await readEntries(password);

  return entries.slice(-limit).reverse();

}



export async function getAllAuditEvents(password: string): Promise<AuditEntry[]> {

  const entries = await readEntries(password);

  return entries.slice().reverse();

}



export async function clearAuditLog(password: string): Promise<void> {

  await persistEntries(password, []);

}



export async function exportAuditLogJson(password: string): Promise<string> {

  const entries = await readEntries(password);

  return JSON.stringify({ exportedAt: new Date().toISOString(), entries }, null, 2);

}



export function formatAuditEventLabel(type: AuditEventType): string {

  const labels: Record<AuditEventType, string> = {

    vault_unlock: 'Vault unlocked',

    vault_lock: 'Vault locked',

    vault_unlock_failed: 'Failed unlock attempt',

    note_save: 'Note saved',

    note_delete: 'Note deleted',

    note_export: 'Note exported',

    vault_export: 'Vault exported',

    vault_bundle_export: 'Web bundle exported',

    vault_import: 'Vault imported',

    attachment_add: 'Attachment added',

    attachment_delete: 'Attachment securely deleted',

    attachment_view: 'Attachment viewed',

    auto_lock: 'Auto-lock triggered',

    clipboard_copy: 'Clipboard copy',

    template_save: 'Template saved',

    biometric_success: 'Biometric unlock',

    biometric_fail: 'Biometric unlock failed',

    policy_view: 'Policy viewed',

  };

  return labels[type] ?? type;

}


