import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import KeyboardAwareScrollView from '@/components/KeyboardAwareScrollView';
import PasswordInput from '@/components/PasswordInput';
import { useAppTheme } from '@/context/ThemeContext';
import { useVault } from '@/context/VaultContext';
import {
  enableBiometricUnlock,
  isBiometricHardwareAvailable,
  isBiometricUnlockEnabled,
  retrievePasswordWithBiometrics,
} from '@/services/biometrics';
import { appendAuditEvent, recordPendingAuditEvent } from '@/services/auditLog';
import {
  getMasterPasswordRequirementsText,
  getMasterPasswordValidationMessage,
} from '@/services/passwordPolicy';

interface AuthGateProps {
  children: React.ReactNode;
  title?: string;
}

export default function AuthGate({ children, title = 'Totus Secure Notes' }: AuthGateProps) {
  const { isUnlocked, hasPassword, isLoading, unlock, setupPassword, isInitialized } = useVault();
  const { theme } = useAppTheme();
  const insets = useSafeAreaInsets();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [enableBiometricsOnSetup, setEnableBiometricsOnSetup] = useState(true);
  const biometricPromptedRef = useRef(false);

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
      setEnableBiometricsOnSetup(hardware);
    })();
  }, [hasPassword, isUnlocked]);

  const handleBiometricUnlock = useCallback(async () => {
    setSubmitting(true);
    setError('');
    const storedPassword = await retrievePasswordWithBiometrics();
    if (!storedPassword) {
      recordPendingAuditEvent('biometric_fail').catch(() => undefined);
      setError('Biometric unlock failed. Use your master password.');
      setSubmitting(false);
      return;
    }

    const success = await unlock(storedPassword);
    if (!success) {
      recordPendingAuditEvent('biometric_fail', 'stored credentials invalid').catch(() => undefined);
      setError('Stored credentials are invalid. Use your master password.');
    } else {
      appendAuditEvent(storedPassword, 'biometric_success').catch(() => undefined);
    }
    setSubmitting(false);
  }, [unlock]);

  useEffect(() => {
    if (
      !hasPassword ||
      isUnlocked ||
      !biometricAvailable ||
      !biometricEnabled ||
      biometricPromptedRef.current ||
      submitting
    ) {
      return;
    }

    biometricPromptedRef.current = true;
    const timer = setTimeout(() => {
      handleBiometricUnlock();
    }, 400);

    return () => clearTimeout(timer);
  }, [
    hasPassword,
    isUnlocked,
    biometricAvailable,
    biometricEnabled,
    submitting,
    handleBiometricUnlock,
  ]);

  useEffect(() => {
    if (isUnlocked) {
      biometricPromptedRef.current = false;
    }
  }, [isUnlocked]);

  if (!isInitialized || isLoading) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
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
    const validationMessage = getMasterPasswordValidationMessage(password);
    if (validationMessage) {
      setError(validationMessage);
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
      if (biometricAvailable && enableBiometricsOnSetup) {
        const enabled = await enableBiometricUnlock(password);
        setBiometricEnabled(enabled);
      }
      setPassword('');
      setConfirmPassword('');
    } catch {
      setError('Could not set master password.');
    }
    setSubmitting(false);
  };

  return (
    <KeyboardAwareScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 24 }]}
      keyboardVerticalOffset={insets.top}>
      <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
        <Text style={[styles.subtitle, { color: theme.textMuted }]}>
          {hasPassword
            ? 'Enter your master password to unlock encrypted notes.'
            : 'Create a master password to encrypt notes on this device.'}
        </Text>

        {!hasPassword ? (
          <Text style={[styles.requirements, { color: theme.textMuted }]}>
            {getMasterPasswordRequirementsText()}
          </Text>
        ) : null}

        <PasswordInput
          placeholder="Master password"
          value={password}
          onChangeText={setPassword}
        />

        {!hasPassword && (
          <PasswordInput
            placeholder="Confirm password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
        )}

        {!hasPassword && biometricAvailable ? (
          <View style={styles.biometricRow}>
            <View style={styles.biometricText}>
              <Text style={[styles.biometricLabel, { color: theme.text }]}>Use biometrics to unlock</Text>
              <Text style={[styles.biometricHint, { color: theme.textMuted }]}>
                Fingerprint or face recognition on this device.
              </Text>
            </View>
            <Switch
              value={enableBiometricsOnSetup}
              onValueChange={setEnableBiometricsOnSetup}
            />
          </View>
        ) : null}

        {error ? <Text style={[styles.error, { color: theme.danger }]}>{error}</Text> : null}

        <Pressable
          style={[styles.button, { backgroundColor: theme.primary }, submitting && styles.buttonDisabled]}
          disabled={submitting}
          onPress={hasPassword ? handleUnlock : handleSetup}>
          <Text style={[styles.buttonText, { color: theme.primaryText }]}>
            {submitting ? 'Please wait...' : hasPassword ? 'Unlock Vault' : 'Create Master Password'}
          </Text>
        </Pressable>

        {hasPassword && biometricAvailable && biometricEnabled ? (
          <Pressable
            style={[
              styles.button,
              { backgroundColor: theme.surfaceSecondary },
              submitting && styles.buttonDisabled,
            ]}
            disabled={submitting}
            onPress={handleBiometricUnlock}>
            <Text style={[styles.secondaryButtonText, { color: theme.text }]}>Unlock with Biometrics</Text>
          </Pressable>
        ) : null}

        {hasPassword && biometricAvailable && !biometricEnabled ? (
          <Text style={[styles.biometricHint, { color: theme.textMuted }]}>
            Tip: unlock once with your password, then enable biometric unlock in Settings.
          </Text>
        ) : null}
      </View>
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    borderRadius: 16,
    padding: 24,
    gap: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
  },
  requirements: {
    fontSize: 13,
    lineHeight: 20,
  },
  biometricRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  biometricText: {
    flex: 1,
    gap: 4,
  },
  biometricLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  biometricHint: {
    fontSize: 13,
    lineHeight: 18,
  },
  error: {
    fontSize: 14,
  },
  button: {
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    fontWeight: '600',
    fontSize: 16,
  },
  secondaryButtonText: {
    fontWeight: '600',
    fontSize: 16,
  },
});
