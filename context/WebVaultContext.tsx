import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Platform } from 'react-native';

import { decryptVaultBundle, DecryptedVaultBundle } from '@/services/vaultCrypto.web';
import {
  clearWebVaultSession,
  getWebVaultSession,
  setWebVaultSession,
  subscribeWebVaultSession,
  touchWebVaultSession,
} from '@/services/webVaultSession';

interface WebVaultContextValue {
  unlocked: boolean;
  bundle: DecryptedVaultBundle | null;
  unlock: (bundleJson: string, password: string) => Promise<void>;
  lock: () => void;
  touchActivity: () => void;
  error: string;
  clearError: () => void;
}

const WebVaultContext = createContext<WebVaultContextValue | null>(null);

export function WebVaultProvider({ children }: { children: React.ReactNode }) {
  const [sessionTick, setSessionTick] = useState(0);
  const [error, setError] = useState('');

  const syncSession = useCallback(() => {
    setSessionTick((value) => value + 1);
  }, []);

  useEffect(() => subscribeWebVaultSession(syncSession), [syncSession]);

  const session = getWebVaultSession();
  const bundle = session?.bundle ?? null;

  const lock = useCallback(() => {
    clearWebVaultSession();
    setError('');
    syncSession();
  }, [syncSession]);

  const unlock = useCallback(
    async (bundleJson: string, password: string) => {
      setError('');
      try {
        const decrypted = await decryptVaultBundle(bundleJson, password);
        setWebVaultSession(decrypted, password);
        syncSession();
      } catch {
        setError('Could not unlock bundle. Check your master password.');
        throw new Error('Unlock failed');
      }
    },
    [syncSession],
  );

  const touchActivity = useCallback(() => {
    touchWebVaultSession();
  }, []);

  const clearError = useCallback(() => setError(''), []);

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;

    const scrub = () => lock();

    const onVisibility = () => {
      if (document.visibilityState === 'hidden') scrub();
    };

    window.addEventListener('pagehide', scrub);
    window.addEventListener('beforeunload', scrub);
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      window.removeEventListener('pagehide', scrub);
      window.removeEventListener('beforeunload', scrub);
      document.removeEventListener('visibilitychange', onVisibility);
      clearWebVaultSession();
    };
  }, [lock]);

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined' || !bundle) return;

    const onActivity = () => touchWebVaultSession();
    window.addEventListener('pointerdown', onActivity);
    window.addEventListener('keydown', onActivity);

    return () => {
      window.removeEventListener('pointerdown', onActivity);
      window.removeEventListener('keydown', onActivity);
    };
  }, [bundle, sessionTick]);

  const value = useMemo(
    () => ({
      unlocked: bundle != null,
      bundle,
      unlock,
      lock,
      touchActivity,
      error,
      clearError,
    }),
    [bundle, unlock, lock, touchActivity, error, clearError, sessionTick],
  );

  return <WebVaultContext.Provider value={value}>{children}</WebVaultContext.Provider>;
}

export function useWebVault(): WebVaultContextValue {
  const ctx = useContext(WebVaultContext);
  if (!ctx) {
    throw new Error('useWebVault must be used within WebVaultProvider');
  }
  return ctx;
}
