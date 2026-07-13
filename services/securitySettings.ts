import * as SecureStore from 'expo-secure-store';

const AUTO_LOCK_KEY = 'totus_auto_lock_minutes';
const CLIPBOARD_TIMEOUT_KEY = 'totus_clipboard_timeout_sec';
const AUDIT_MAX_ENTRIES_KEY = 'totus_audit_max_entries';

export type AutoLockMinutes = 1 | 5 | 15 | 0;

export const DEFAULT_AUDIT_MAX_ENTRIES = 500;
export const MIN_AUDIT_MAX_ENTRIES = 100;
export const MAX_AUDIT_MAX_ENTRIES = 2000;

export async function getAutoLockMinutes(): Promise<AutoLockMinutes> {
  const stored = await SecureStore.getItemAsync(AUTO_LOCK_KEY);
  if (stored === '1' || stored === '5' || stored === '15' || stored === '0') {
    return Number(stored) as AutoLockMinutes;
  }
  return 5;
}

export async function setAutoLockMinutes(minutes: AutoLockMinutes): Promise<void> {
  await SecureStore.setItemAsync(AUTO_LOCK_KEY, String(minutes));
}

export async function getClipboardTimeoutSec(): Promise<number> {
  const stored = await SecureStore.getItemAsync(CLIPBOARD_TIMEOUT_KEY);
  if (stored) {
    const parsed = Number(stored);
    if (parsed >= 15 && parsed <= 300) {
      return parsed;
    }
  }
  return 60;
}

export async function setClipboardTimeoutSec(seconds: number): Promise<void> {
  await SecureStore.setItemAsync(CLIPBOARD_TIMEOUT_KEY, String(seconds));
}

export async function getAuditMaxEntries(): Promise<number> {
  const stored = await SecureStore.getItemAsync(AUDIT_MAX_ENTRIES_KEY);
  if (stored) {
    const parsed = Number(stored);
    if (parsed >= MIN_AUDIT_MAX_ENTRIES && parsed <= MAX_AUDIT_MAX_ENTRIES) {
      return parsed;
    }
  }
  return DEFAULT_AUDIT_MAX_ENTRIES;
}

export async function setAuditMaxEntries(max: number): Promise<void> {
  const clamped = Math.min(MAX_AUDIT_MAX_ENTRIES, Math.max(MIN_AUDIT_MAX_ENTRIES, max));
  await SecureStore.setItemAsync(AUDIT_MAX_ENTRIES_KEY, String(clamped));
}
