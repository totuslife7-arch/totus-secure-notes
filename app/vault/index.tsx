import { router } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import PasswordInput from '@/components/PasswordInput';
import { VaultSecurityNotice } from '@/components/VaultSecurityNotice';
import { useAppTheme } from '@/context/ThemeContext';
import { useWebVault } from '@/context/WebVaultContext';
import { releaseStringRef } from '@/utils/zeroizeString';

export default function VaultImportScreen() {
  const { theme } = useAppTheme();
  const { unlock, error, clearError } = useWebVault();
  const [password, setPassword] = useState('');
  const [bundleJson, setBundleJson] = useState<string | null>(null);
  const [fileName, setFileName] = useState('');
  const [localError, setLocalError] = useState('');

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setLocalError('');
    clearError();
    try {
      const text = await file.text();
      setBundleJson(text);
    } catch {
      setLocalError('Could not read the selected file.');
    }
  };

  const clearLocalSecrets = useCallback(() => {
    setPassword((current) => {
      releaseStringRef(current);
      return '';
    });
    setBundleJson(null);
    setFileName('');
  }, []);

  const handleUnlock = async () => {
    if (!bundleJson) {
      setLocalError('Import a .totus vault bundle first.');
      return;
    }
    if (!password.trim()) {
      setLocalError('Enter your vault password.');
      return;
    }
    setLocalError('');
    try {
      await unlock(bundleJson, password);
      clearLocalSecrets();
      router.push('/vault/notes' as never);
    } catch {
      setLocalError('Wrong password or invalid bundle file.');
    }
  };

  if (Platform.OS !== 'web') {
    return (
      <View style={[styles.centered, { backgroundColor: theme.background }]}>
        <Text style={{ color: theme.text }}>The web vault viewer is available at /vault on web builds.</Text>
      </View>
    );
  }

  const displayError = localError || error;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <VaultSecurityNotice />
      <Text style={[styles.title, { color: theme.text }]}>Totus Vault Viewer</Text>
      <Text style={[styles.body, { color: theme.textMuted }]}>
        Import a .totus bundle exported from the mobile app. Decryption runs in your browser only —
        nothing is uploaded or stored in localStorage, sessionStorage, or IndexedDB.
      </Text>

      <label style={styles.fileLabel}>
        <input
          type="file"
          accept=".totus,application/json"
          onChange={handleFileChange}
          style={{ marginTop: 12 }}
        />
      </label>
      {fileName ? (
        <Text style={{ color: theme.textSecondary, marginTop: 8 }}>Selected: {fileName}</Text>
      ) : null}

      <PasswordInput
        style={styles.input}
        placeholder="Vault password"
        value={password}
        onChangeText={setPassword}
        autoCorrect={false}
      />

      {displayError ? <Text style={{ color: theme.danger, marginBottom: 8 }}>{displayError}</Text> : null}

      <Pressable style={[styles.button, { backgroundColor: theme.primary }]} onPress={handleUnlock}>
        <Text style={{ color: theme.primaryText, fontWeight: '600' }}>Unlock</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, maxWidth: 520, alignSelf: 'center', width: '100%' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 8 },
  body: { fontSize: 15, lineHeight: 22, marginBottom: 16 },
  input: { marginTop: 16, marginBottom: 12 },
  button: { borderRadius: 10, paddingVertical: 14, alignItems: 'center', marginTop: 8 },
  fileLabel: { cursor: 'pointer' as never },
});
