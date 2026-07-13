import { router } from 'expo-router';
import React, { useCallback, useEffect } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { VaultLockButton, VaultSecurityNotice } from '@/components/VaultSecurityNotice';
import { useAppTheme } from '@/context/ThemeContext';
import { useWebVault } from '@/context/WebVaultContext';

export default function VaultTemplatesScreen() {
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

  const templates = bundle.customTemplates?.templates ?? [];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <VaultSecurityNotice compact />
      <View style={styles.headerRow}>
        <Pressable onPress={() => router.push('/vault/notes' as never)}>
          <Text style={{ color: theme.primary, fontWeight: '600' }}>← Notes</Text>
        </Pressable>
        <VaultLockButton onLock={handleLock} />
      </View>

      <FlatList
        data={templates}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text style={{ color: theme.textMuted, padding: 16 }}>
            No custom templates in this bundle.
          </Text>
        }
        renderItem={({ item }) => (
          <Pressable
            style={[styles.row, { backgroundColor: theme.surface, borderColor: theme.border }]}
            onPress={() =>
              router.push({ pathname: '/vault/template/[id]' as never, params: { id: item.id } })
            }>
            <Text style={[styles.title, { color: theme.text }]}>{item.title}</Text>
            <Text style={{ color: theme.textMuted, fontSize: 13 }}>{item.category ?? 'Other'}</Text>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  row: { borderRadius: 10, borderWidth: 1, padding: 14, marginBottom: 10 },
  title: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
});
