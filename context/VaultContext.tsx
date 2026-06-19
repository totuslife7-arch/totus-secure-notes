import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

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
import { refreshBiometricPassword } from '@/services/biometrics';

interface VaultContextValue {
  notes: Note[];
  isUnlocked: boolean;
  isInitialized: boolean;
  hasPassword: boolean;
  isLoading: boolean;
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

export function VaultProvider({ children }: { children: React.ReactNode }) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [sessionPassword, setSessionPassword] = useState<string | null>(null);
  const [hasPassword, setHasPassword] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const exists = await hasMasterPassword();
      setHasPassword(exists);
      setIsInitialized(true);
      setIsLoading(false);
    })();
  }, []);

  const persistVault = useCallback(async (vault: VaultData, password: string) => {
    await saveVault(vault, password);
    setNotes(vault.notes);
  }, []);

  const unlock = useCallback(async (password: string) => {
    setIsLoading(true);
    try {
      const valid = await verifyMasterPassword(password);
      if (!valid) {
        return false;
      }
      const vault = await loadVault(password);
      setNotes(vault.notes);
      setSessionPassword(password);
      return true;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const lock = useCallback(() => {
    setSessionPassword(null);
    setNotes([]);
  }, []);

  const setupPassword = useCallback(
    async (password: string) => {
      await setMasterPassword(password);
      setHasPassword(true);
      const vault: VaultData = { notes: [] };
      await persistVault(vault, password);
      setSessionPassword(password);
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
      await persistVault(vault, next);
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

  const saveNote = useCallback(
    async (note: Note) => {
      if (!sessionPassword) {
        throw new Error('Vault is locked');
      }
      const updatedNote = { ...note, updatedAt: new Date().toISOString() };
      const nextNotes = [...notes.filter((item) => item.id !== note.id), updatedNote].sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      );
      await persistVault({ notes: nextNotes }, sessionPassword);
    },
    [notes, persistVault, sessionPassword],
  );

  const deleteNote = useCallback(
    async (id: string) => {
      if (!sessionPassword) {
        throw new Error('Vault is locked');
      }
      const nextNotes = notes.filter((note) => note.id !== id);
      await persistVault({ notes: nextNotes }, sessionPassword);
    },
    [notes, persistVault, sessionPassword],
  );

  const getNote = useCallback(
    (id: string) => notes.find((note) => note.id === id),
    [notes],
  );

  const createNote = useCallback(
    async (title?: string, content?: string, templateId?: string) => {
      if (!sessionPassword) {
        throw new Error('Vault is locked');
      }
      const note = createEmptyNote(title, content, templateId);
      const nextNotes = [note, ...notes];
      await persistVault({ notes: nextNotes }, sessionPassword);
      return note;
    },
    [notes, persistVault, sessionPassword],
  );

  const importVault = useCallback(
    async (uri: string, password: string) => {
      try {
        const vault = await importVaultFile(uri, password);
        if (sessionPassword) {
          setNotes(vault.notes);
        }
        return true;
      } catch {
        return false;
      }
    },
    [sessionPassword],
  );

  const value = useMemo(
    () => ({
      notes,
      isUnlocked: sessionPassword != null,
      isInitialized,
      hasPassword,
      isLoading,
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
