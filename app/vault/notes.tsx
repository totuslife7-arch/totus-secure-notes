import { router } from 'expo-router';
import React, { useCallback, useEffect } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { VaultLockButton, VaultSecurityNotice } from '@/components/VaultSecurityNotice';
import { useAppTheme } from '@/context/ThemeContext';
import { useWebVault } from '@/context/WebVaultContext';
import {
  copyVaultClipboard,
  WEB_VAULT_CLIPBOARD_WARNING,
} from '@/services/webVaultClipboard';

export default function VaultNotesScreen() {
  const { theme } = useAppTheme();
  const { unlocked, bundle, lock } = useWebVault();

  useEffect(() => {
    if (!unlocked) {
      router.replace('/vault' as never);
    }
  }, [unlocked]);

  const handleLock = useCallback(() => {
    lock();
    router.replace('/vault' as never);
  }, [lock]);

  if (!unlocked || !bundle) {
    return null;
  }

  const notes = [...bundle.notes.notes].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );

  const handleCopy = (title: string, content: string) => {
    Alert.alert('Clipboard warning', WEB_VAULT_CLIPBOARD_WARNING, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Copy',
        onPress: () => {
          copyVaultClipboard(content).catch(() => undefined);
          Alert.alert('Copied', `"${title}" copied. Clipboard clears automatically after a short timeout.`);
        },
      },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <VaultSecurityNotice compact />
      <View style={styles.headerRow}>
        <Pressable onPress={() => router.push('/vault/templates' as never)}>
          <Text style={{ color: theme.primary, fontWeight: '600' }}>Templates →</Text>
        </Pressable>
        <VaultLockButton onLock={handleLock} />
      </View>

      <FlatList
        data={notes}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text style={{ color: theme.textMuted, padding: 16 }}>No notes in this bundle.</Text>
        }
        renderItem={({ item }) => (
          <Pressable
            style={[styles.row, { backgroundColor: theme.surface, borderColor: theme.border }]}
            onPress={() => handleCopy(item.title, item.content)}>
            <Text style={[styles.title, { color: theme.text }]}>{item.title}</Text>
            <Text style={{ color: theme.textMuted, fontSize: 12 }}>
              Updated {new Date(item.updatedAt).toLocaleString()} · tap to copy content
            </Text>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  row: { borderRadius: 10, borderWidth: 1, padding: 14, marginBottom: 10 },
  title: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
});
