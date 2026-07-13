import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { AppState, AppStateStatus } from 'react-native';

import { appendAuditEvent, flushPendingAuditEvents, recordPendingAuditEvent } from '@/services/auditLog';
import { refreshBiometricPassword } from '@/services/biometrics';
import { cancelReminder, scheduleNoteReminder } from '@/services/notifications';
import { syncAllNoteReminders } from '@/services/reminderSync';
import { getAutoLockMinutes } from '@/services/securitySettings';
import { clearSessionVaultCrypto } from '@/services/sessionCrypto';
import { discardGpsBuffer } from '@/services/trip/gpsTripRecorder';
import {
  createEmptyNote,
  hasMasterPassword,
  importVaultFile,
  loadVault,
  Note,
  saveVault,
  setMasterPassword,
  VaultData,
  verifyMasterPassword,
} from '@/services/storage';

interface VaultContextValue {
  notes: Note[];
  isUnlocked: boolean;
  isInitialized: boolean;
  hasPassword: boolean;
  isLoading: boolean;
  isSaving: boolean;
  unlock: (password: string) => Promise<boolean>;
  lock: () => void;
  setupPassword: (password: string) => Promise<void>;
  changePassword: (current: string, next: string) => Promise<boolean>;
  refreshVault: () => Promise<void>;
  saveNote: (note: Note) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  getNote: (id: string) => Note | undefined;
  createNote: (title?: string, content?: string, templateId?: string) => Promise<Note>;
  importVault: (uri: string, password: string) => Promise<boolean>;
  sessionPassword: string | null;
}

const VaultContext = createContext<VaultContextValue | null>(null);

const reminderNotificationIds = new Map<string, string>();

export function VaultProvider({ children }: { children: React.ReactNode }) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [sessionPassword, setSessionPassword] = useState<string | null>(null);
  const [hasPassword, setHasPassword] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const lastActiveRef = useRef(Date.now());
  const sessionPasswordRef = useRef<string | null>(null);

  useEffect(() => {
    sessionPasswordRef.current = sessionPassword;
  }, [sessionPassword]);

  useEffect(() => {
    (async () => {
      const exists = await hasMasterPassword();
      setHasPassword(exists);
      setIsInitialized(true);
      setIsLoading(false);
    })();
  }, []);

  const persistChainRef = useRef(Promise.resolve());
  const notesRef = useRef(notes);

  useEffect(() => {
    notesRef.current = notes;
  }, [notes]);

  const persistVault = useCallback(async (buildNotes: (current: Note[]) => Note[], password: string) => {
    const task = persistChainRef.current.then(async () => {
      setIsSaving(true);
      try {
        const nextNotes = buildNotes(notesRef.current);
        await saveVault({ v: 2, notes: nextNotes }, password);
        notesRef.current = nextNotes;
        setNotes(nextNotes);
      } finally {
        setIsSaving(false);
      }
    });
    persistChainRef.current = task.catch(() => undefined);
    return task;
  }, []);

  const lockTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const lock = useCallback(() => {
    const password = sessionPasswordRef.current;
    if (password) {
      appendAuditEvent(password, 'vault_lock').catch(() => undefined);
    }
    void clearSessionVaultCrypto();
    discardGpsBuffer();
    setSessionPassword(null);
    setNotes([]);
  }, []);

  useEffect(() => {
    if (!sessionPassword) {
      return;
    }

    const handleAppState = async (nextState: AppStateStatus) => {
      if (nextState === 'active') {
        if (lockTimerRef.current) {
          clearTimeout(lockTimerRef.current);
          lockTimerRef.current = null;
        }
        lastActiveRef.current = Date.now();
        return;
      }

      if (nextState === 'background' || nextState === 'inactive') {
        const minutes = await getAutoLockMinutes();
        if (minutes === 0 || lockTimerRef.current) {
          return;
        }

        lockTimerRef.current = setTimeout(() => {
          const password = sessionPasswordRef.current;
          if (password) {
            appendAuditEvent(password, 'auto_lock').catch(() => undefined);
          }
          lock();
          lockTimerRef.current = null;
        }, minutes * 60_000);
      }
    };

    const subscription = AppState.addEventListener('change', handleAppState);
    return () => {
      subscription.remove();
      if (lockTimerRef.current) {
        clearTimeout(lockTimerRef.current);
      }
    };
  }, [sessionPassword, lock]);

  const unlock = useCallback(async (password: string) => {
    setIsLoading(true);
    try {
      const valid = await verifyMasterPassword(password);
      if (!valid) {
        recordPendingAuditEvent('vault_unlock_failed').catch(() => undefined);
        return false;
      }
      const vault = await loadVault(password);
      setNotes(vault.notes);
      setSessionPassword(password);
      const synced = await syncAllNoteReminders(vault.notes, reminderNotificationIds);
      synced.forEach((id, noteId) => reminderNotificationIds.set(noteId, id));
      lastActiveRef.current = Date.now();
      await flushPendingAuditEvents(password);
      appendAuditEvent(password, 'vault_unlock').catch(() => undefined);
      return true;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const setupPassword = useCallback(
    async (password: string) => {
      await setMasterPassword(password);
      setHasPassword(true);
      const vault: VaultData = { v: 2, notes: [] };
      await persistVault(() => vault.notes, password);
      setSessionPassword(password);
      lastActiveRef.current = Date.now();
    },
    [persistVault],
  );

  const changePassword = useCallback(
    async (current: string, next: string) => {
      const valid = await verifyMasterPassword(current);
      if (!valid) {
        return false;
      }
      const vault = await loadVault(current);
      await setMasterPassword(next);
      await clearSessionVaultCrypto();
      await persistVault(() => vault.notes, next);
      setSessionPassword(next);
      await refreshBiometricPassword(next);
      return true;
    },
    [persistVault],
  );

  const refreshVault = useCallback(async () => {
    if (!sessionPassword) {
      return;
    }
    const vault = await loadVault(sessionPassword);
    setNotes(vault.notes);
  }, [sessionPassword]);

  const syncReminder = useCallback(async (note: Note, password: string) => {
    const existingId = reminderNotificationIds.get(note.id);
    if (existingId) {
      await cancelReminder(existingId);
      reminderNotificationIds.delete(note.id);
    }

    if (note.reminderAt) {
      const notificationId = await scheduleNoteReminder(note.id, note.title, note.reminderAt);
      if (notificationId) {
        reminderNotificationIds.set(note.id, notificationId);
        await appendAuditEvent(password, 'note_save', `Scheduled reminder for ${note.id}`);
      }
    }
  }, []);

  const saveNote = useCallback(
    async (note: Note) => {
      const password = sessionPasswordRef.current;
      if (!password) {
        throw new Error('Vault is locked');
      }

      const updatedNote = { ...note, updatedAt: new Date().toISOString() };

      await persistVault(
        (current) =>
          [...current.filter((item) => item.id !== note.id), updatedNote].sort(
            (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
          ),
        password,
      );
      await syncReminder(updatedNote, password);
      appendAuditEvent(password, 'note_save', note.id).catch(() => undefined);
    },
    [persistVault, syncReminder],
  );

  const deleteNote = useCallback(
    async (id: string) => {
      const password = sessionPasswordRef.current;
      if (!password) {
        throw new Error('Vault is locked');
      }

      const existingReminder = reminderNotificationIds.get(id);
      await cancelReminder(existingReminder);
      reminderNotificationIds.delete(id);

      await persistVault((current) => current.filter((note) => note.id !== id), password);
      appendAuditEvent(password, 'note_delete', id).catch(() => undefined);
    },
    [persistVault],
  );

  const getNote = useCallback(
    (id: string) => notes.find((note) => note.id === id),
    [notes],
  );

  const createNote = useCallback(
    async (title?: string, content?: string, templateId?: string) => {
      const password = sessionPasswordRef.current;
      if (!password) {
        throw new Error('Vault is locked');
      }

      const note = createEmptyNote(title, content, templateId);
      await persistVault((current) => [note, ...current], password);

      appendAuditEvent(password, 'note_save', `created:${note.id}`).catch(() => undefined);
      return note;
    },
    [persistVault],
  );

  const importVault = useCallback(
    async (uri: string, password: string) => {
      try {
        const vault = await importVaultFile(uri, password);
        if (sessionPasswordRef.current) {
          setNotes(vault.notes);
        }
        appendAuditEvent(password, 'vault_import').catch(() => undefined);
        return true;
      } catch {
        return false;
      }
    },
    [],
  );

  const value = useMemo(
    () => ({
      notes,
      isUnlocked: sessionPassword != null,
      isInitialized,
      hasPassword,
      isLoading,
      isSaving,
      unlock,
      lock,
      setupPassword,
      changePassword,
      refreshVault,
      saveNote,
      deleteNote,
      getNote,
      createNote,
      importVault,
      sessionPassword,
    }),
    [
      notes,
      sessionPassword,
      isInitialized,
      hasPassword,
      isLoading,
      isSaving,
      unlock,
      lock,
      setupPassword,
      changePassword,
      refreshVault,
      saveNote,
      deleteNote,
      getNote,
      createNote,
      importVault,
    ],
  );

  return <VaultContext.Provider value={value}>{children}</VaultContext.Provider>;
}

export function useVault() {
  const context = useContext(VaultContext);
  if (!context) {
    throw new Error('useVault must be used within VaultProvider');
  }
  return context;
}
