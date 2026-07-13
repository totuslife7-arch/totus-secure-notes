import * as Linking from 'expo-linking';
import { Platform } from 'react-native';

import { VAULT_WEB_URL } from '@/constants/vaultWebUrl';

const DDG_ANDROID_PACKAGE = 'com.duckduckgo.mobile.android';

export type VaultWebOpenResult = 'duckduckgo' | 'default';

/**
 * Open the hosted web vault viewer.
 * On Android, optionally targets DuckDuck Go when installed; otherwise falls back to the default browser.
 * Desktop and iOS cannot be forced into a specific browser or private mode.
 */
export async function openVaultWebUrl(options?: {
  preferDuckDuckGo?: boolean;
}): Promise<VaultWebOpenResult> {
  if (Platform.OS === 'android' && options?.preferDuckDuckGo) {
    const hostPath = VAULT_WEB_URL.replace(/^https:\/\//, '');
    const fallback = encodeURIComponent(VAULT_WEB_URL);
    const intentUrl = `intent://${hostPath}#Intent;scheme=https;package=${DDG_ANDROID_PACKAGE};S.browser_fallback_url=${fallback};end`;
    try {
      await Linking.openURL(intentUrl);
      return 'duckduckgo';
    } catch {
      // DuckDuck Go not installed or intent rejected — fall through.
    }
  }

  await Linking.openURL(VAULT_WEB_URL);
  return 'default';
}
