import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/context/ThemeContext';

interface VaultSecurityNoticeProps {
  compact?: boolean;
}

export function VaultSecurityNotice({ compact }: VaultSecurityNoticeProps) {
  const { theme } = useAppTheme();

  return (
    <View
      style={[
        styles.box,
        compact ? styles.compact : null,
        { backgroundColor: theme.surfaceSecondary, borderColor: theme.border },
      ]}>
      <Text style={[styles.title, { color: theme.text }]}>Security notice</Text>
      <Text style={[styles.body, { color: theme.textMuted }]}>
        Use a <Text style={styles.strong}>private / incognito window</Text> (Firefox or DuckDuck Go
        recommended). Close the tab when finished — decrypted data stays in browser memory until you
        lock or leave.
      </Text>
      {!compact ? (
        <Text style={[styles.body, { color: theme.textMuted }]}>
          We cannot force a specific browser on desktop. Do not use the web vault on shared or public
          computers. This viewer is not HIPAA/PIPEDA certified.
        </Text>
      ) : null}
    </View>
  );
}

interface VaultLockButtonProps {
  onLock: () => void;
}

export function VaultLockButton({ onLock }: VaultLockButtonProps) {
  const { theme } = useAppTheme();

  return (
    <Pressable
      style={[styles.lockButton, { backgroundColor: theme.danger, borderColor: theme.danger }]}
      onPress={onLock}
      accessibilityRole="button"
      accessibilityLabel="Lock now">
      <Text style={[styles.lockText, { color: '#fff' }]}>Lock now</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  box: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 14,
    marginBottom: 16,
  },
  compact: {
    marginBottom: 12,
    padding: 12,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 6,
  },
  body: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 6,
  },
  strong: {
    fontWeight: '700',
  },
  lockButton: {
    borderRadius: 10,
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignItems: 'center',
  },
  lockText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
