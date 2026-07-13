import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import { bytesToBase64, base64ToBytes } from '@/utils/base64';

const SESSION_DEK_KEY = 'totus_session_dek_hw';

/**
 * Layer 2 — hardware-backed session DEK cache (Secure Enclave / Android Keystore via expo-secure-store).
 * Web vault viewer has no SecureStore; password-only envelope decryption applies there.
 */
export async function storeSessionDek(dek: Uint8Array): Promise<void> {
  if (Platform.OS === 'web') {
    return;
  }
  await SecureStore.setItemAsync(SESSION_DEK_KEY, bytesToBase64(dek));
}

export async function retrieveSessionDek(): Promise<Uint8Array | null> {
  if (Platform.OS === 'web') {
    return null;
  }
  const encoded = await SecureStore.getItemAsync(SESSION_DEK_KEY);
  if (!encoded) {
    return null;
  }
  return base64ToBytes(encoded);
}

export async function clearSessionDek(): Promise<void> {
  if (Platform.OS === 'web') {
    return;
  }
  await SecureStore.deleteItemAsync(SESSION_DEK_KEY);
}
