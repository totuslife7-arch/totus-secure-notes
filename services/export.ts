import * as Clipboard from 'expo-clipboard';
import * as Sharing from 'expo-sharing';

import { exportVaultFile } from '@/services/storage';

export async function copyToClipboard(text: string): Promise<void> {
  await Clipboard.setStringAsync(text);
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
    return true;
  } catch (error) {
    console.error('Share failed:', error);
    return false;
  }
}
