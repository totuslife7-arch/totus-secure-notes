import * as Clipboard from 'expo-clipboard';
import * as Sharing from 'expo-sharing';

import { appendAuditEvent } from '@/services/auditLog';
import { getClipboardTimeoutSec } from '@/services/securitySettings';
import { exportFullVaultBundle, exportVaultFile } from '@/services/storage';

let clipboardTimer: ReturnType<typeof setTimeout> | null = null;

export async function copyToClipboard(
  text: string,
  password?: string | null,
  detail?: string,
): Promise<void> {
  await Clipboard.setStringAsync(text);

  if (password) {
    appendAuditEvent(password, 'clipboard_copy', detail).catch(() => undefined);
  }

  if (clipboardTimer) {
    clearTimeout(clipboardTimer);
  }

  const timeoutSec = await getClipboardTimeoutSec();
  clipboardTimer = setTimeout(async () => {
    const current = await Clipboard.getStringAsync();
    if (current === text) {
      await Clipboard.setStringAsync('');
    }
  }, timeoutSec * 1000);
}

export async function shareEncryptedVault(password: string): Promise<boolean> {
  try {
    const filePath = await exportVaultFile(password);
    const available = await Sharing.isAvailableAsync();
    if (!available) {
      return false;
    }

    await Sharing.shareAsync(filePath, {
      mimeType: 'application/octet-stream',
      dialogTitle: 'Export Encrypted Notes',
      UTI: 'public.data',
    });
    appendAuditEvent(password, 'vault_export').catch(() => undefined);
    return true;
  } catch (error) {
    console.error('Share failed:', error);
    return false;
  }
}

export async function shareFullVaultBundle(password: string): Promise<boolean> {
  try {
    const filePath = await exportFullVaultBundle(password);
    const available = await Sharing.isAvailableAsync();
    if (!available) {
      return false;
    }
    await Sharing.shareAsync(filePath, {
      mimeType: 'application/json',
      dialogTitle: 'Export for Desktop Viewer',
      UTI: 'public.json',
    });
    appendAuditEvent(password, 'vault_bundle_export').catch(() => undefined);
    return true;
  } catch (error) {
    console.error('Desktop bundle share failed:', error);
    return false;
  }
}
