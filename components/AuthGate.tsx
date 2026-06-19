import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { useVault } from '@/context/VaultContext';
import {
  isBiometricHardwareAvailable,
  isBiometricUnlockEnabled,
  retrievePasswordWithBiometrics,
} from '@/services/biometrics';

interface AuthGateProps {
  children: React.ReactNode;
  title?: string;
}

export default function AuthGate({ children, title = 'Totus Secure Notes' }: AuthGateProps) {
  const { isUnlocked, hasPassword, isLoading, unlock, setupPassword, isInitialized } = useVault();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);

  useEffect(() => {
    if (!hasPassword || isUnlocked) {
      return;
    }

    (async () => {
      const [hardware, enabled] = await Promise.all([
        isBiometricHardwareAvailable(),
        isBiometricUnlockEnabled(),
      ]);
      setBiometricAvailable(hardware);
      setBiometricEnabled(enabled);
    })();
  }, [hasPassword, isUnlocked]);

  if (!isInitialized || isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (isUnlocked) {
    return <>{children}</>;
  }

  const handleUnlock = async () => {
    setSubmitting(true);
    setError('');
    const success = await unlock(password);
    if (!success) {
      setError('Incorrect master password.');
    }
    setSubmitting(false);
  };

  const handleSetup = async () => {
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      await setupPassword(password);
      setPassword('');
      setConfirmPassword('');
    } catch {
      setError('Could not set master password.');
    }
    setSubmitting(false);
  };

  const handleBiometricUnlock = async () => {
    setSubmitting(true);
    setError('');
    const storedPassword = await retrievePasswordWithBiometrics();
    if (!storedPassword) {
      setError('Biometric unlock failed. Use your master password.');
      setSubmitting(false);
      return;
    }

    const success = await unlock(storedPassword);
    if (!success) {
      setError('Stored credentials are invalid. Use your master password.');
    }
    setSubmitting(false);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.card}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>
          {hasPassword
            ? 'Enter your master password to unlock encrypted notes.'
            : 'Create a master password to encrypt notes on this device.'}
        </Text>

        <TextInput
          style={styles.input}
          secureTextEntry
          placeholder="Master password"
          value={password}
          onChangeText={setPassword}
          autoCapitalize="none"
        />

        {!hasPassword && (
          <TextInput
            style={styles.input}
            secureTextEntry
            placeholder="Confirm password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            autoCapitalize="none"
          />
        )}

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Pressable
          style={[styles.button, submitting && styles.buttonDisabled]}
          disabled={submitting}
          onPress={hasPassword ? handleUnlock : handleSetup}>
          <Text style={styles.buttonText}>
            {submitting ? 'Please wait...' : hasPassword ? 'Unlock Vault' : 'Create Master Password'}
          </Text>
        </Pressable>

        {hasPassword && biometricAvailable && biometricEnabled ? (
          <Pressable
            style={[styles.button, styles.secondaryButton, submitting && styles.buttonDisabled]}
            disabled={submitting}
            onPress={handleBiometricUnlock}>
            <Text style={styles.secondaryButtonText}>Unlock with Biometrics</Text>
          </Pressable>
        ) : null}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#f5f7fb',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    gap: 12,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  subtitle: {
    fontSize: 15,
    color: '#555',
    lineHeight: 22,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d8dee9',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  error: {
    color: '#c0392b',
    fontSize: 14,
  },
  button: {
    backgroundColor: '#2563eb',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  secondaryButton: {
    backgroundColor: '#e5e7eb',
  },
  secondaryButtonText: {
    color: '#111827',
    fontWeight: '600',
    fontSize: 16,
  },
});
