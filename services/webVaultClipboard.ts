import * as Clipboard from 'expo-clipboard';

import { getClipboardTimeoutSec } from '@/services/securitySettings';

const WEB_VAULT_CLIPBOARD_DEFAULT_SEC = 60;

let clipboardTimer: ReturnType<typeof setTimeout> | null = null;

async function resolveClipboardTimeoutSec(): Promise<number> {
  try {
    const timeout = await getClipboardTimeoutSec();
    if (timeout >= 15 && timeout <= 300) return timeout;
  } catch {
    // SecureStore unavailable on hosted web vault — use in-memory default.
  }
  return WEB_VAULT_CLIPBOARD_DEFAULT_SEC;
}

export const WEB_VAULT_CLIPBOARD_WARNING =
  'Copied text is visible to your operating system and other apps. Clipboard is cleared automatically after a short timeout — paste promptly and lock the vault when finished.';

export async function copyVaultClipboard(text: string): Promise<void> {
  await Clipboard.setStringAsync(text);

  if (clipboardTimer) clearTimeout(clipboardTimer);

  const timeoutSec = await resolveClipboardTimeoutSec();
  clipboardTimer = setTimeout(async () => {
    const current = await Clipboard.getStringAsync();
    if (current === text) {
      await Clipboard.setStringAsync('');
    }
  }, timeoutSec * 1000);
}
