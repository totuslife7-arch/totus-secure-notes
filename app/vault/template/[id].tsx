import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useMemo } from 'react';
import { Alert, Text, View } from 'react-native';

import GenericCustomForm from '@/components/templates/GenericCustomForm';
import { VaultLockButton } from '@/components/VaultSecurityNotice';
import { useAppTheme } from '@/context/ThemeContext';
import { useWebVault } from '@/context/WebVaultContext';
import {
  copyVaultClipboard,
  WEB_VAULT_CLIPBOARD_WARNING,
} from '@/services/webVaultClipboard';

export default function VaultTemplateFillScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme } = useAppTheme();
  const { unlocked, bundle, lock } = useWebVault();

  const template = useMemo(() => {
    if (!unlocked || !bundle || !id) return null;
    return bundle.customTemplates?.templates.find((t) => t.id === id) ?? null;
  }, [unlocked, bundle, id]);

  const handleLock = useCallback(() => {
    lock();
    router.replace('/vault' as never);
  }, [lock]);

  const handleClipboardCopy = async (text: string) => {
    try {
      await new Promise<void>((resolve, reject) => {
        Alert.alert('Clipboard warning', WEB_VAULT_CLIPBOARD_WARNING, [
          { text: 'Cancel', style: 'cancel', onPress: () => reject(new Error('cancelled')) },
          { text: 'Copy', onPress: () => resolve() },
        ]);
      });
      await copyVaultClipboard(text);
      Alert.alert('Copied', 'Text copied. Clipboard clears automatically after a short timeout.');
    } catch {
      // User cancelled clipboard copy.
    }
  };

  if (!template) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: theme.textMuted }}>Template not found. Return to import.</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'flex-end', padding: 12, paddingBottom: 0 }}>
        <VaultLockButton onLock={handleLock} />
      </View>
      <GenericCustomForm
        template={template}
        emrCopyLabel="Copy for Plexia"
        readOnly
        onClipboardCopy={handleClipboardCopy}
      />
    </View>
  );
}
