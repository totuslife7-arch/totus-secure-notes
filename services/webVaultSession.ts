import { DecryptedVaultBundle } from '@/services/vaultCrypto.web';

/** In-memory only — never persisted to localStorage, sessionStorage, IndexedDB, or URL params. */
export const WEB_VAULT_IDLE_LOCK_MS = 5 * 60 * 1000;

let sessionBundle: DecryptedVaultBundle | null = null;
let sessionPassword: string | null = null;
let idleTimer: ReturnType<typeof setTimeout> | null = null;

type SessionListener = () => void;
const listeners = new Set<SessionListener>();

function notify(): void {
  listeners.forEach((listener) => listener());
}

function scrubBundle(bundle: DecryptedVaultBundle): void {
  const notes = bundle.notes?.notes;
  if (notes) {
    for (const note of notes) {
      try {
        Object.assign(note, { title: '', content: '', extraNotes: '' });
      } catch {
        // Frozen objects — drop reference only.
      }
    }
    notes.length = 0;
  }

  const templates = bundle.customTemplates?.templates;
  if (templates) {
    for (const template of templates) {
      try {
        Object.assign(template, { title: '', description: '' });
      } catch {
        // Frozen objects — drop reference only.
      }
    }
    templates.length = 0;
  }
}

function clearIdleTimer(): void {
  if (idleTimer) {
    clearTimeout(idleTimer);
    idleTimer = null;
  }
}

function scheduleIdleLock(): void {
  clearIdleTimer();
  if (!sessionBundle) return;
  idleTimer = setTimeout(() => {
    clearWebVaultSession();
  }, WEB_VAULT_IDLE_LOCK_MS);
}

export function getWebVaultSession(): {
  bundle: DecryptedVaultBundle;
  password: string;
} | null {
  if (!sessionBundle || !sessionPassword) return null;
  return { bundle: sessionBundle, password: sessionPassword };
}

export function setWebVaultSession(bundle: DecryptedVaultBundle, password: string): void {
  sessionBundle = bundle;
  sessionPassword = password;
  scheduleIdleLock();
  notify();
}

export function touchWebVaultSession(): void {
  if (sessionBundle) scheduleIdleLock();
}

export function clearWebVaultSession(): void {
  clearIdleTimer();
  if (sessionBundle) {
    scrubBundle(sessionBundle);
  }
  sessionPassword = null;
  sessionBundle = null;
  notify();
}

export function subscribeWebVaultSession(listener: SessionListener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
