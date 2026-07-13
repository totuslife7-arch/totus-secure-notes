import * as SecureStore from 'expo-secure-store';

import { DEV_UNLOCK_SECRET, DEV_UNLOCK_STORE_KEY } from '@/constants/devUnlock';

export type DevUnlockToggleResult = 'activated' | 'deactivated' | 'invalid';

export async function isDevUnlockActive(): Promise<boolean> {
  try {
    const value = await SecureStore.getItemAsync(DEV_UNLOCK_STORE_KEY);
    return value === 'true';
  } catch {
    return false;
  }
}

export async function toggleDevUnlock(code: string): Promise<DevUnlockToggleResult> {
  const trimmed = code.trim();
  if (trimmed !== DEV_UNLOCK_SECRET) {
    return 'invalid';
  }

  const active = await isDevUnlockActive();
  if (active) {
    await SecureStore.deleteItemAsync(DEV_UNLOCK_STORE_KEY);
    return 'deactivated';
  }

  await SecureStore.setItemAsync(DEV_UNLOCK_STORE_KEY, 'true');
  return 'activated';
}

export async function disableDevUnlock(): Promise<void> {
  await SecureStore.deleteItemAsync(DEV_UNLOCK_STORE_KEY);
}
