import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as ScreenCapture from 'expo-screen-capture';
import * as Sharing from 'expo-sharing';
import * as WebBrowser from 'expo-web-browser';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Platform,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import AdBanner from '@/components/AdBanner';
import TotusAiHubCard from '@/components/TotusAiHubCard';
import KeyboardAwareScrollView from '@/components/KeyboardAwareScrollView';
import PaywallSheet from '@/components/PaywallSheet';
import PasswordInput from '@/components/PasswordInput';
import ThemedTextInput from '@/components/ThemedTextInput';
import { ThemeMode } from '@/constants/theme';
import { useAppTheme } from '@/context/ThemeContext';
import { useVault } from '@/context/VaultContext';
import {
  clearAuditLog,
  exportAuditLogJson,
  formatAuditEventLabel,
  getAllAuditEvents,
  getRecentAuditEvents,
  appendAuditEvent,
} from '@/services/auditLog';
import {
  disableBiometricUnlock,
  enableBiometricUnlock,
  isBiometricHardwareAvailable,
  isBiometricUnlockEnabled,
} from '@/services/biometrics';
import { useMonetization } from '@/context/MonetizationContext';
import {
  hasTripPlannerPro,
} from '@/services/monetization';
import {
  DrivingRouteEngine,
  EXTERNAL_MAPS_LABELS,
  ExternalMapsApp,
  getDrivingRouteEngine,
  getExternalMapsApp,
  getGoogleMapsApiKey,
  getInAppMapEnabled,
  getMapboxApiKey,
  ROUTE_ENGINE_LABELS,
  setDrivingRouteEngine,
  setExternalMapsApp,
  setGoogleMapsApiKey,
  setInAppMapEnabled,
  setMapboxApiKey as persistMapboxApiKey,
} from '@/services/trip/mapsSettings';
import { shareEncryptedVault, shareFullVaultBundle } from '@/services/export';
import {
  AutoLockMinutes,
  getAutoLockMinutes,
  getAuditMaxEntries,
  getClipboardTimeoutSec,
  setAuditMaxEntries,
  setAutoLockMinutes,
  setClipboardTimeoutSec,
} from '@/services/securitySettings';
import {
  getMasterPasswordRequirementsText,
  getMasterPasswordValidationMessage,
} from '@/services/passwordPolicy';
import { POLICY_URLS } from '@/constants/policyUrls';
import { VAULT_WEB_URL } from '@/constants/vaultWebUrl';
import { openVaultWebUrl } from '@/services/openVaultWebUrl';

const THEME_OPTIONS: ThemeMode[] = ['system', 'light', 'dark'];
const AUTO_LOCK_OPTIONS: AutoLockMinutes[] = [0, 1, 5, 15];

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
  const { theme, mode, setMode } = useAppTheme();
  const insets = useSafeAreaInsets();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [importPassword, setImportPassword] = useState('');
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [autoLockMinutes, setAutoLockMinutesState] = useState<AutoLockMinutes>(5);
  const [clipboardTimeout, setClipboardTimeoutState] = useState('60');
  const [blockScreenshots, setBlockScreenshots] = useState(true);
  const [auditPreview, setAuditPreview] = useState('');
  const [auditExpanded, setAuditExpanded] = useState(false);
  const [auditMaxEntries, setAuditMaxEntriesState] = useState('500');
  const { state: monetization, restore, refresh } = useMonetization();
  const [paywallVisible, setPaywallVisible] = useState(false);
  const [externalMapsApp, setExternalMapsAppState] = useState<ExternalMapsApp>('google');
  const [inAppMapEnabled, setInAppMapEnabledState] = useState(true);
  const [routeEngine, setRouteEngineState] = useState<DrivingRouteEngine>('osrm');
  const [mapsAdvancedOpen, setMapsAdvancedOpen] = useState(false);
  const [googleApiKey, setGoogleApiKey] = useState('');
  const [mapboxApiKey, setMapboxApiKey] = useState('');

  const openPolicy = (url: string, label?: string) => {
    if (sessionPassword && label) {
      appendAuditEvent(sessionPassword, 'policy_view', label).catch(() => undefined);
    }
    WebBrowser.openBrowserAsync(url).catch(() => undefined);
  };

  useEffect(() => {
    (async () => {
      const [hardware, enabled, lockMinutes, clipSec, mapsApp, inAppMap, engine, gKey, mKey, auditMax] =
        await Promise.all([
        isBiometricHardwareAvailable(),
        isBiometricUnlockEnabled(),
        getAutoLockMinutes(),
        getClipboardTimeoutSec(),
        getExternalMapsApp(),
        getInAppMapEnabled(),
        getDrivingRouteEngine(),
        getGoogleMapsApiKey(),
        getMapboxApiKey(),
        getAuditMaxEntries(),
      ]);
      setBiometricAvailable(hardware);
      setBiometricEnabled(enabled);
      setAutoLockMinutesState(lockMinutes);
      setClipboardTimeoutState(String(clipSec));
      setExternalMapsAppState(mapsApp);
      setInAppMapEnabledState(inAppMap);
      setRouteEngineState(engine);
      setGoogleApiKey(gKey ?? '');
      setMapboxApiKey(mKey ?? '');
      setAuditMaxEntriesState(String(auditMax));
    })();
  }, [isUnlocked]);

  useEffect(() => {
    if (!isUnlocked || !sessionPassword) {
      ScreenCapture.allowScreenCaptureAsync().catch(() => undefined);
      return;
    }

    if (blockScreenshots) {
      ScreenCapture.preventScreenCaptureAsync().catch(() => undefined);
    } else {
      ScreenCapture.allowScreenCaptureAsync().catch(() => undefined);
    }

    return () => {
      ScreenCapture.allowScreenCaptureAsync().catch(() => undefined);
    };
  }, [isUnlocked, sessionPassword, blockScreenshots]);

  useEffect(() => {
    if (!sessionPassword) {
      setAuditPreview('');
      return;
    }

    const loadEvents = auditExpanded
      ? getAllAuditEvents(sessionPassword)
      : getRecentAuditEvents(sessionPassword, 8);
    loadEvents.then((events) => {
      setAuditPreview(
        events
          .map(
            (event) =>
              `${formatAuditEventLabel(event.type)} · ${new Date(event.timestamp).toLocaleString()}${event.detail ? ` · ${event.detail}` : ''}`,
          )
          .join('\n') || 'No audit events yet.',
      );
    });
  }, [sessionPassword, isUnlocked, auditExpanded]);

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
    const validationMessage = getMasterPasswordValidationMessage(newPassword);
    if (validationMessage) {
      Alert.alert('Password requirements', validationMessage);
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
    const validationMessage = getMasterPasswordValidationMessage(newPassword);
    if (validationMessage) {
      Alert.alert('Password requirements', validationMessage);
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Mismatch', 'New passwords do not match.');
      return;
    }
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

  const handleDesktopExport = async () => {
    if (!sessionPassword) {
      Alert.alert('Locked', 'Unlock the vault before exporting.');
      return;
    }
    const shared = await shareFullVaultBundle(sessionPassword);
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

  const handleAutoLockChange = async (minutes: AutoLockMinutes) => {
    setAutoLockMinutesState(minutes);
    await setAutoLockMinutes(minutes);
  };

  const handleClipboardTimeoutSave = async () => {
    const parsed = Number(clipboardTimeout);
    if (Number.isNaN(parsed) || parsed < 15 || parsed > 300) {
      Alert.alert('Invalid value', 'Use a number between 15 and 300 seconds.');
      return;
    }
    await setClipboardTimeoutSec(parsed);
    Alert.alert('Saved', 'Clipboard will clear after copying sensitive text.');
  };

  return (
    <>
    <KeyboardAwareScrollView
      extraBottomInset={insets.bottom}
      contentContainerStyle={[
        styles.container,
        { backgroundColor: theme.background, paddingBottom: insets.bottom + 16 },
      ]}>
      <Text style={[styles.heading, { color: theme.text }]}>Settings</Text>

      <Pressable
        style={[styles.hubCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
        onPress={() => router.push('/settings/about' as never)}>
        <Text style={[styles.hubTitle, { color: theme.text }]}>About & Legal</Text>
        <Text style={[styles.hubHint, { color: theme.textMuted }]}>
          Version, policies, tester unlock (tap version 7×)
        </Text>
      </Pressable>

      <Pressable
        style={[styles.hubCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
        onPress={() => router.push('/settings/totus-ai' as never)}>
        <Text style={[styles.hubTitle, { color: theme.text }]}>Totus Assist</Text>
        <Text style={[styles.hubHint, { color: theme.textMuted }]}>
          On-device AI model download, diagnostics, unlock help
        </Text>
      </Pressable>

      <Text style={[styles.heading, { color: theme.text }]}>Appearance</Text>
      <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <Text style={[styles.cardTitle, { color: theme.text }]}>Theme</Text>
        <View style={styles.rowWrap}>
          {THEME_OPTIONS.map((option) => (
            <Pressable
              key={option}
              onPress={() => setMode(option)}
              style={[
                styles.optionChip,
                {
                  backgroundColor: mode === option ? theme.primary : theme.surfaceSecondary,
                  borderColor: theme.border,
                },
              ]}>
              <Text style={{ color: mode === option ? theme.primaryText : theme.textSecondary }}>
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <Text style={[styles.heading, { color: theme.text }]}>Security</Text>
      <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <Text style={[styles.cardTitle, { color: theme.text }]}>Three-layer encryption</Text>
        <Text style={[styles.body, { color: theme.textMuted }]}>
          1. Argon2id key derivation (memory-hard, open source @noble/hashes){'\n'}
          2. Hardware-backed session key (Secure Enclave / Android Keystore via expo-secure-store){'\n'}
          3. Envelope encryption — per-vault data key wrapped with master key; AES-256-GCM + HMAC on
          .totus exports
        </Text>
        <Text style={[styles.rowHint, { color: theme.textMuted }]}>
          Legacy vaults (PBKDF2) decrypt normally and upgrade to Argon2id on next save. This is a
          productivity tool — not HIPAA/PIPEDA certified. See Security policy for details.
        </Text>
        <Text style={[styles.body, { color: theme.textMuted }]}>
          Secure media: photos and files attached to notes are encrypted in your vault. When possible,
          originals are removed from your gallery after import. Secure delete shreds vault copies
          (best-effort; platform limits may apply).
        </Text>
        <Pressable
          style={[styles.button, { backgroundColor: theme.surfaceSecondary }]}
          onPress={() => openPolicy(POLICY_URLS.security, 'Security policy')}>
          <Text style={[styles.secondaryButtonText, { color: theme.text }]}>Security policy</Text>
        </Pressable>
        <Pressable
          style={[styles.button, { backgroundColor: theme.surfaceSecondary }]}
          onPress={() => openPolicy(POLICY_URLS.legalDisclaimer, 'Legal disclaimer')}>
          <Text style={[styles.secondaryButtonText, { color: theme.text }]}>
            Compliance & legal disclaimer
          </Text>
        </Pressable>
      </View>
      <Text style={[styles.body, { color: theme.textMuted }]}>
        Master password is only stored locally if you opt in to biometric unlock.
      </Text>

      {!hasPassword ? (
        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>Create Master Password</Text>
          <Text style={[styles.rowHint, { color: theme.textMuted }]}>
            {getMasterPasswordRequirementsText()}
          </Text>
          <PasswordInput
            style={styles.input}
            placeholder="New password"
            value={newPassword}
            onChangeText={setNewPassword}
          />
          <PasswordInput
            style={styles.input}
            placeholder="Confirm password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
          <Pressable style={[styles.button, { backgroundColor: theme.primary }]} onPress={handleSetup}>
            <Text style={[styles.buttonText, { color: theme.primaryText }]}>Save Master Password</Text>
          </Pressable>
        </View>
      ) : (
        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>Change Master Password</Text>
          <Text style={[styles.rowHint, { color: theme.textMuted }]}>
            {getMasterPasswordRequirementsText()}
          </Text>
          <PasswordInput
            style={styles.input}
            placeholder="Current password"
            value={currentPassword}
            onChangeText={setCurrentPassword}
          />
          <PasswordInput
            style={styles.input}
            placeholder="New password"
            value={newPassword}
            onChangeText={setNewPassword}
          />
          <PasswordInput
            style={styles.input}
            placeholder="Confirm new password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
          <Pressable style={[styles.button, { backgroundColor: theme.primary }]} onPress={handleChange}>
            <Text style={[styles.buttonText, { color: theme.primaryText }]}>Update Password</Text>
          </Pressable>
          {isUnlocked ? (
            <Pressable
              style={[styles.button, { backgroundColor: theme.surfaceSecondary }]}
              onPress={lock}>
              <Text style={[styles.secondaryButtonText, { color: theme.text }]}>Lock Vault</Text>
            </Pressable>
          ) : null}
        </View>
      )}

      <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <Text style={[styles.cardTitle, { color: theme.text }]}>Auto-lock</Text>
        <Text style={[styles.rowHint, { color: theme.textMuted }]}>
          Lock vault after this many minutes in the background (0 = never).
        </Text>
        <View style={styles.rowWrap}>
          {AUTO_LOCK_OPTIONS.map((minutes) => (
            <Pressable
              key={minutes}
              onPress={() => handleAutoLockChange(minutes)}
              style={[
                styles.optionChip,
                {
                  backgroundColor:
                    autoLockMinutes === minutes ? theme.primary : theme.surfaceSecondary,
                  borderColor: theme.border,
                },
              ]}>
              <Text
                style={{
                  color: autoLockMinutes === minutes ? theme.primaryText : theme.textSecondary,
                }}>
                {minutes === 0 ? 'Never' : `${minutes} min`}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <View style={styles.row}>
          <View style={styles.rowText}>
            <Text style={[styles.cardTitle, { color: theme.text }]}>Block screenshots</Text>
            <Text style={[styles.rowHint, { color: theme.textMuted }]}>
              Prevent screenshots while the vault is unlocked.
            </Text>
          </View>
          <Switch value={blockScreenshots} onValueChange={setBlockScreenshots} disabled={!isUnlocked} />
        </View>
      </View>

      {hasPassword && biometricAvailable ? (
        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={styles.row}>
            <View style={styles.rowText}>
              <Text style={[styles.cardTitle, { color: theme.text }]}>Biometric Unlock</Text>
              <Text style={[styles.rowHint, { color: theme.textMuted }]}>
                Use fingerprint or face recognition to unlock the vault on this device.
              </Text>
            </View>
            <Switch
              value={biometricEnabled}
              onValueChange={handleBiometricToggle}
              disabled={!isUnlocked}
            />
          </View>
        </View>
      ) : null}

      <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <Text style={[styles.cardTitle, { color: theme.text }]}>Clipboard timeout (seconds)</Text>
        <ThemedTextInput
          style={styles.input}
          keyboardType="number-pad"
          placeholder="60"
          value={clipboardTimeout}
          onChangeText={setClipboardTimeoutState}
        />
        <Pressable
          style={[styles.button, { backgroundColor: theme.primary }]}
          onPress={handleClipboardTimeoutSave}>
          <Text style={[styles.buttonText, { color: theme.primaryText }]}>Save clipboard timeout</Text>
        </Pressable>
      </View>

      <Text style={[styles.heading, { color: theme.text }]}>Subscriptions</Text>
      <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <Text style={[styles.body, { color: theme.textMuted }]}>
          {monetization.isPremiumLifetime
            ? 'Pro Lifetime active — no ads, Trip Planner Pro, Template Studio, and all premium features.'
            : monetization.isPro
              ? 'Pro Monthly active — banner ads removed. Upgrade to Pro Lifetime for Trip Planner Pro and Template Studio.'
              : 'Free tier includes banner ads. Pro Monthly removes ads; Pro Lifetime unlocks all premium features.'}
        </Text>
        {!monetization.isPremiumLifetime ? (
          <Pressable
            style={[styles.button, { backgroundColor: theme.primary }]}
            onPress={() => setPaywallVisible(true)}>
            <Text style={[styles.buttonText, { color: theme.primaryText }]}>Upgrade to Pro</Text>
          </Pressable>
        ) : null}
        <Pressable
          style={[styles.button, { backgroundColor: theme.surfaceSecondary }]}
          onPress={async () => {
            await restore();
            Alert.alert('Restored', 'Purchases refreshed from the app store.');
          }}>
          <Text style={[styles.secondaryButtonText, { color: theme.text }]}>Restore purchases</Text>
        </Pressable>
      </View>

      <Text style={[styles.heading, { color: theme.text }]}>Trip Planner Pro</Text>
      <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <Text style={[styles.body, { color: theme.textMuted }]}>
          {monetization.devUnlockActive
            ? 'Developer unlock active — driving route distance, multi-stop maps, and in-app map preview. No API keys required.'
            : monetization && hasTripPlannerPro(monetization)
              ? 'Pro Lifetime active — driving route distance and in-app map preview. No API keys required.'
              : 'Pro Lifetime unlocks driving route distance, multi-stop Google Maps, and in-app map preview.'}
        </Text>
        {!hasTripPlannerPro(monetization) ? (
          <Pressable
            style={[styles.button, { backgroundColor: theme.primary }]}
            onPress={() => setPaywallVisible(true)}>
            <Text style={[styles.buttonText, { color: theme.primaryText }]}>Upgrade to Pro Lifetime</Text>
          </Pressable>
        ) : null}

        <Text style={[styles.cardTitle, { color: theme.text }]}>Open routes in</Text>
        <Text style={[styles.body, { color: theme.textMuted }]}>
          {Platform.OS === 'ios'
            ? 'iPhone: Google Maps (app) supports multi-stop routes (Pro). Apple Maps opens origin → destination. No API key needed.'
            : 'Android: opens multi-stop routes in Google Maps (Pro). No API key needed.'}
        </Text>
        <View style={styles.rowWrap}>
          {(['google', ...(Platform.OS === 'ios' ? (['apple'] as const) : [])] as ExternalMapsApp[]).map(
            (option) => (
              <Pressable
                key={option}
                onPress={async () => {
                  setExternalMapsAppState(option);
                  await setExternalMapsApp(option);
                }}
                style={[
                  styles.optionChip,
                  {
                    backgroundColor:
                      externalMapsApp === option ? theme.primary : theme.surfaceSecondary,
                    borderColor: theme.border,
                  },
                ]}>
                <Text
                  style={{
                    color: externalMapsApp === option ? theme.primaryText : theme.textSecondary,
                  }}>
                  {EXTERNAL_MAPS_LABELS[option]}
                </Text>
              </Pressable>
            ),
          )}
        </View>

        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.cardTitle, { color: theme.text }]}>In-app map preview</Text>
            <Text style={[styles.body, { color: theme.textMuted }]}>
              OpenStreetMap tiles inside the app after planning a Pro route.
            </Text>
          </View>
          <Switch
            value={inAppMapEnabled}
            onValueChange={async (value) => {
              setInAppMapEnabledState(value);
              await setInAppMapEnabled(value);
            }}
          />
        </View>

        <Text style={[styles.cardTitle, { color: theme.text }]}>Driving distance (Pro)</Text>
        <Text style={[styles.body, { color: theme.textMuted }]}>
          Uses {ROUTE_ENGINE_LABELS[routeEngine]} — geocodes addresses and calculates road distance.
          Free tier still has GPS recording and straight-line estimates.
        </Text>

        <Pressable
          style={[styles.button, { backgroundColor: theme.surfaceSecondary }]}
          onPress={() => setMapsAdvancedOpen((open) => !open)}>
          <Text style={[styles.secondaryButtonText, { color: theme.text }]}>
            {mapsAdvancedOpen ? 'Hide advanced routing' : 'Advanced routing (optional API keys)'}
          </Text>
        </Pressable>

        {mapsAdvancedOpen ? (
          <>
            <Text style={[styles.body, { color: theme.textMuted }]}>
              Default OSRM routing works without keys. Optionally supply your own Google or Mapbox
              credentials for higher geocoding limits.
            </Text>
            <View style={styles.rowWrap}>
              {(['osrm', 'google', 'mapbox'] as DrivingRouteEngine[]).map((option) => (
                <Pressable
                  key={option}
                  onPress={async () => {
                    setRouteEngineState(option);
                    await setDrivingRouteEngine(option);
                  }}
                  style={[
                    styles.optionChip,
                    {
                      backgroundColor:
                        routeEngine === option ? theme.primary : theme.surfaceSecondary,
                      borderColor: theme.border,
                    },
                  ]}>
                  <Text
                    style={{
                      color: routeEngine === option ? theme.primaryText : theme.textSecondary,
                    }}>
                    {ROUTE_ENGINE_LABELS[option]}
                  </Text>
                </Pressable>
              ))}
            </View>
            {routeEngine === 'google' ? (
              <ThemedTextInput
                style={styles.input}
                placeholder="Google Maps API key (optional)"
                value={googleApiKey}
                onChangeText={setGoogleApiKey}
                autoCapitalize="none"
              />
            ) : null}
            {routeEngine === 'mapbox' ? (
              <ThemedTextInput
                style={styles.input}
                placeholder="Mapbox access token (optional)"
                value={mapboxApiKey}
                onChangeText={setMapboxApiKey}
                autoCapitalize="none"
              />
            ) : null}
            {routeEngine !== 'osrm' ? (
              <Pressable
                style={[styles.button, { backgroundColor: theme.primary }]}
                onPress={async () => {
                  if (routeEngine === 'google') {
                    await setGoogleMapsApiKey(googleApiKey);
                  } else {
                    await persistMapboxApiKey(mapboxApiKey);
                  }
                  Alert.alert('Saved', 'Routing API key stored securely on this device.');
                }}>
                <Text style={[styles.buttonText, { color: theme.primaryText }]}>Save API key</Text>
              </Pressable>
            ) : null}
          </>
        ) : null}
      </View>

      <Text style={[styles.heading, { color: theme.text }]}>Totus Assist</Text>
      <TotusAiHubCard compact />
      <Pressable
        style={[styles.button, { backgroundColor: theme.surfaceSecondary, marginBottom: 8 }]}
        onPress={() => router.push('/settings/totus-ai' as never)}>
        <Text style={[styles.secondaryButtonText, { color: theme.text }]}>
          Open Totus AI hub (model, capabilities, troubleshooting)
        </Text>
      </Pressable>

      <Text style={[styles.heading, { color: theme.text }]}>Sync to desktop</Text>
      <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <Text style={[styles.cardTitle, { color: theme.text }]}>Desktop access (manual export)</Text>
        <Text style={[styles.body, { color: theme.textMuted }]}>
          Not live cloud sync. Export an encrypted `.totus` bundle from your phone, transfer it to your
          computer, and open it in the web vault viewer. Decryption happens in your browser only —
          read-only, no editing.
        </Text>
        <Text style={[styles.body, { color: theme.textMuted }]}>
          1. Tap Export for desktop viewer below and save the `.totus` file.{'\n'}
          2. Transfer the file to your PC, Mac, or Linux (USB, AirDrop, cloud drive, or work file share).{'\n'}
          3. On desktop, open the web vault in a <Text style={{ fontWeight: '700' }}>private/incognito window</Text> (Firefox or DuckDuck Go recommended).{'\n'}
          4. Import the `.totus` file and enter your vault master password to decrypt locally.{'\n'}
          5. Browse and copy notes and templates as needed, then <Text style={{ fontWeight: '700' }}>lock or close the tab</Text>.
        </Text>
        <Text style={[styles.body, { color: theme.textMuted }]}>
          Recommended on phone: open the vault link in DuckDuck Go private tab (Android) when installed.
          We cannot force a specific browser on desktop or iOS.
        </Text>
        <Pressable
          style={[styles.button, { backgroundColor: theme.primary }]}
          onPress={handleDesktopExport}>
          <Text style={[styles.buttonText, { color: theme.primaryText }]}>
            Export for desktop viewer (.totus)
          </Text>
        </Pressable>
        <Pressable
          style={[styles.button, { backgroundColor: theme.surfaceSecondary }]}
          onPress={() => openVaultWebUrl({ preferDuckDuckGo: true }).catch(() => undefined)}>
          <Text style={[styles.secondaryButtonText, { color: theme.text }]}>
            Open web vault (DuckDuck Go on Android)
          </Text>
        </Pressable>
        <Pressable
          style={[styles.button, { backgroundColor: theme.surfaceSecondary }]}
          onPress={() => openVaultWebUrl().catch(() => undefined)}>
          <Text style={[styles.secondaryButtonText, { color: theme.text }]}>Open web vault (default browser)</Text>
        </Pressable>
        <Text style={[styles.rowHint, { color: theme.textMuted }]}>{VAULT_WEB_URL}</Text>
      </View>

      <Text style={[styles.heading, { color: theme.text }]}>Backup</Text>
      <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <Text style={[styles.body, { color: theme.textMuted }]}>
          Encrypted `.enc` backup for restoring your vault on another phone. Separate from the `.totus`
          desktop viewer export above.
        </Text>
        <Pressable style={[styles.button, { backgroundColor: theme.primary }]} onPress={handleExport}>
          <Text style={[styles.buttonText, { color: theme.primaryText }]}>Export Encrypted Vault</Text>
        </Pressable>
        <PasswordInput
          style={styles.input}
          placeholder="Import password"
          value={importPassword}
          onChangeText={setImportPassword}
        />
        <Pressable
          style={[styles.button, { backgroundColor: theme.surfaceSecondary }]}
          onPress={handleImport}>
          <Text style={[styles.secondaryButtonText, { color: theme.text }]}>Import Encrypted Vault</Text>
        </Pressable>
      </View>

      <Text style={[styles.heading, { color: theme.text }]}>Audit log (local, encrypted)</Text>
      <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <Text style={[styles.body, { color: theme.textMuted }]}>
          {auditPreview || 'Unlock vault to view recent events.'}
        </Text>
        {sessionPassword ? (
          <>
            <Pressable
              style={[styles.button, { backgroundColor: theme.surfaceSecondary }]}
              onPress={() => setAuditExpanded((value) => !value)}>
              <Text style={[styles.secondaryButtonText, { color: theme.text }]}>
                {auditExpanded ? 'Show fewer events' : 'Show all events'}
              </Text>
            </Pressable>
            <Pressable
              style={[styles.button, { backgroundColor: theme.surfaceSecondary }]}
              onPress={async () => {
                const json = await exportAuditLogJson(sessionPassword);
                const path = `${FileSystem.cacheDirectory}totus_audit_log.json`;
                await FileSystem.writeAsStringAsync(path, json);
                if (await Sharing.isAvailableAsync()) {
                  await Sharing.shareAsync(path, { mimeType: 'application/json' });
                }
              }}>
              <Text style={[styles.secondaryButtonText, { color: theme.text }]}>Export audit log</Text>
            </Pressable>
            <Pressable
              style={[styles.button, { backgroundColor: theme.surfaceSecondary }]}
              onPress={() => {
                Alert.alert('Clear audit log?', 'This removes all local audit entries.', [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Clear',
                    style: 'destructive',
                    onPress: async () => {
                      await clearAuditLog(sessionPassword);
                      setAuditPreview('No audit events yet.');
                    },
                  },
                ]);
              }}>
              <Text style={[styles.secondaryButtonText, { color: theme.text }]}>Clear audit log</Text>
            </Pressable>
            <Text style={[styles.cardTitle, { color: theme.text }]}>Retention cap (entries)</Text>
            <ThemedTextInput
              style={styles.input}
              keyboardType="number-pad"
              value={auditMaxEntries}
              onChangeText={setAuditMaxEntriesState}
            />
            <Pressable
              style={[styles.button, { backgroundColor: theme.primary }]}
              onPress={async () => {
                const parsed = Number(auditMaxEntries);
                if (Number.isNaN(parsed) || parsed < 100 || parsed > 2000) {
                  Alert.alert('Invalid value', 'Use a number between 100 and 2000.');
                  return;
                }
                await setAuditMaxEntries(parsed);
                Alert.alert('Saved', 'Older audit entries will be trimmed on next event.');
              }}>
              <Text style={[styles.buttonText, { color: theme.primaryText }]}>Save retention cap</Text>
            </Pressable>
          </>
        ) : null}
      </View>

      <AdBanner style={{ marginTop: 8, marginBottom: 16 }} />
    </KeyboardAwareScrollView>

    <PaywallSheet
      visible={paywallVisible}
      onClose={() => setPaywallVisible(false)}
    />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 12,
  },
  heading: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 8,
  },
  hubCard: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    gap: 4,
  },
  hubTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  hubHint: {
    fontSize: 13,
    lineHeight: 18,
  },
  body: {
    fontSize: 14,
    lineHeight: 21,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    gap: 10,
    borderWidth: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
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
  },
  rowWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionChip: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
  },
  input: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  button: {
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  buttonText: {
    fontWeight: '600',
  },
  secondaryButtonText: {
    fontWeight: '600',
  },
});
