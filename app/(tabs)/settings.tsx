import * as DocumentPicker from 'expo-document-picker';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';

import { useVault } from '@/context/VaultContext';
import {
  disableBiometricUnlock,
  enableBiometricUnlock,
  isBiometricHardwareAvailable,
  isBiometricUnlockEnabled,
} from '@/services/biometrics';
import { shareEncryptedVault } from '@/services/export';

export default function SettingsScreen() {
  const {
    hasPassword,
    isUnlocked,
    lock,
    setupPassword,
    changePassword,
    importVault,
    sessionPassword,
  } = useVault();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [importPassword, setImportPassword] = useState('');
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);

  useEffect(() => {
    (async () => {
      const [hardware, enabled] = await Promise.all([
        isBiometricHardwareAvailable(),
        isBiometricUnlockEnabled(),
      ]);
      setBiometricAvailable(hardware);
      setBiometricEnabled(enabled);
    })();
  }, [isUnlocked]);

  const handleBiometricToggle = async (value: boolean) => {
    if (value) {
      if (!sessionPassword) {
        Alert.alert('Locked', 'Unlock the vault before enabling biometrics.');
        return;
      }
      const success = await enableBiometricUnlock(sessionPassword);
      if (!success) {
        Alert.alert('Unavailable', 'Biometric unlock is not available on this device.');
        return;
      }
      setBiometricEnabled(true);
      return;
    }

    await disableBiometricUnlock();
    setBiometricEnabled(false);
  };

  const handleSetup = async () => {
    if (newPassword.length < 8) {
      Alert.alert('Password too short', 'Use at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Mismatch', 'Passwords do not match.');
      return;
    }
    await setupPassword(newPassword);
    Alert.alert('Success', 'Master password created.');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleChange = async () => {
    const success = await changePassword(currentPassword, newPassword);
    if (!success) {
      Alert.alert('Error', 'Could not change password. Check your current password.');
      return;
    }
    Alert.alert('Success', 'Master password updated.');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleExport = async () => {
    if (!sessionPassword) {
      Alert.alert('Locked', 'Unlock the vault before exporting.');
      return;
    }
    const shared = await shareEncryptedVault(sessionPassword);
    if (!shared) {
      Alert.alert('Unavailable', 'Sharing is not available on this device.');
    }
  };

  const handleImport = async () => {
    if (!importPassword.trim()) {
      Alert.alert('Password required', 'Enter the password used to encrypt the vault file.');
      return;
    }

    const result = await DocumentPicker.getDocumentAsync({
      type: '*/*',
      copyToCacheDirectory: true,
    });

    if (result.canceled || !result.assets?.[0]?.uri) {
      return;
    }

    const success = await importVault(result.assets[0].uri, importPassword);
    if (!success) {
      Alert.alert('Import failed', 'Could not decrypt the selected vault file.');
      return;
    }

    Alert.alert('Imported', 'Encrypted vault imported successfully.');
    setImportPassword('');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Security</Text>
      <Text style={styles.body}>
        All notes are encrypted on-device with AES-256-GCM. Your master password is never stored.
      </Text>

      {!hasPassword ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Create Master Password</Text>
          <TextInput
            style={styles.input}
            secureTextEntry
            placeholder="New password"
            value={newPassword}
            onChangeText={setNewPassword}
          />
          <TextInput
            style={styles.input}
            secureTextEntry
            placeholder="Confirm password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
          <Pressable style={styles.button} onPress={handleSetup}>
            <Text style={styles.buttonText}>Save Master Password</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Change Master Password</Text>
          <TextInput
            style={styles.input}
            secureTextEntry
            placeholder="Current password"
            value={currentPassword}
            onChangeText={setCurrentPassword}
          />
          <TextInput
            style={styles.input}
            secureTextEntry
            placeholder="New password"
            value={newPassword}
            onChangeText={setNewPassword}
          />
          <TextInput
            style={styles.input}
            secureTextEntry
            placeholder="Confirm new password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
          <Pressable style={styles.button} onPress={handleChange}>
            <Text style={styles.buttonText}>Update Password</Text>
          </Pressable>
          {isUnlocked ? (
            <Pressable style={[styles.button, styles.secondaryButton]} onPress={lock}>
              <Text style={styles.secondaryButtonText}>Lock Vault</Text>
            </Pressable>
          ) : null}
        </View>
      )}

      {hasPassword && biometricAvailable ? (
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.rowText}>
              <Text style={styles.cardTitle}>Biometric Unlock</Text>
              <Text style={styles.rowHint}>
                Use fingerprint or face recognition to unlock the vault on this device.
              </Text>
            </View>
            <Switch
              value={biometricEnabled}
              onValueChange={handleBiometricToggle}
              disabled={!isUnlocked}
            />
          </View>
          {!isUnlocked ? (
            <Text style={styles.rowHint}>Unlock the vault to change this setting.</Text>
          ) : null}
        </View>
      ) : null}

      <Text style={styles.heading}>Backup</Text>
      <View style={styles.card}>
        <Pressable style={styles.button} onPress={handleExport}>
          <Text style={styles.buttonText}>Export Encrypted Vault</Text>
        </Pressable>
        <TextInput
          style={styles.input}
          secureTextEntry
          placeholder="Import password"
          value={importPassword}
          onChangeText={setImportPassword}
        />
        <Pressable style={[styles.button, styles.secondaryButton]} onPress={handleImport}>
          <Text style={styles.secondaryButtonText}>Import Encrypted Vault</Text>
        </Pressable>
      </View>

      <Text style={styles.heading}>Privacy</Text>
      <Text style={styles.body}>
        Totus Secure Notes stores data locally on your device. No analytics, no telemetry, no cloud
        account required.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f5f7fb',
    gap: 12,
  },
  heading: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginTop: 8,
  },
  body: {
    fontSize: 14,
    lineHeight: 21,
    color: '#4b5563',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  rowText: {
    flex: 1,
    gap: 4,
  },
  rowHint: {
    fontSize: 13,
    lineHeight: 18,
    color: '#6b7280',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#2563eb',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#e5e7eb',
  },
  secondaryButtonText: {
    color: '#111827',
    fontWeight: '600',
  },
});
