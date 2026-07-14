import Constants from 'expo-constants';
import * as WebBrowser from 'expo-web-browser';
import React, { useState } from 'react';
import { Alert, Image, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import KeyboardAwareScrollView from '@/components/KeyboardAwareScrollView';
import ThemedTextInput from '@/components/ThemedTextInput';
import ScreenHeader from '@/components/ui/ScreenHeader';
import { DEV_UNLOCK_VERSION_TAP_COUNT } from '@/constants/devUnlock';
import { POLICY_LINKS, POLICY_URLS } from '@/constants/policyUrls';
import { useAppTheme } from '@/context/ThemeContext';
import { useMonetization } from '@/context/MonetizationContext';
import { useVault } from '@/context/VaultContext';
import { appendAuditEvent } from '@/services/auditLog';
import { disableDevUnlock, toggleDevUnlock } from '@/services/devUnlock';
import { fetchAllPolicyVersions, type PolicyDocument } from '@/services/firebase';
import { isStoreReviewMode } from '@/services/monetization';

export default function AboutScreen() {
  const { theme } = useAppTheme();
  const insets = useSafeAreaInsets();
  const { sessionPassword } = useVault();
  const { state: monetization, refresh } = useMonetization();

  const [versionTapCount, setVersionTapCount] = useState(0);
  const [showDevUnlockEntry, setShowDevUnlockEntry] = useState(false);
  const [devUnlockCode, setDevUnlockCode] = useState('');
  const [policyVersions, setPolicyVersions] = useState<Record<string, PolicyDocument | null> | null>(
    null,
  );
  const [policyCheckStatus, setPolicyCheckStatus] = useState<string | null>(null);

  const version = Constants.expoConfig?.version ?? '1.2.13';
  const versionCode = Constants.expoConfig?.android?.versionCode;
  const packageName =
    Platform.OS === 'android'
      ? Constants.expoConfig?.android?.package
      : Constants.expoConfig?.ios?.bundleIdentifier;

  const openPolicy = (url: string, label?: string) => {
    if (sessionPassword && label) {
      appendAuditEvent(sessionPassword, 'policy_view', label).catch(() => undefined);
    }
    WebBrowser.openBrowserAsync(url).catch(() => undefined);
  };

  const handleVersionTap = () => {
    const next = versionTapCount + 1;
    setVersionTapCount(next);
    if (next >= DEV_UNLOCK_VERSION_TAP_COUNT) {
      setShowDevUnlockEntry(true);
      setVersionTapCount(0);
      Alert.alert('Tester unlock', 'Enter developer code TOTUS-DEV-2026 to unlock Pro for testing.');
    }
  };

  const handleDevUnlockSubmit = async () => {
    const result = await toggleDevUnlock(devUnlockCode);
    if (result === 'invalid') {
      Alert.alert('Invalid code', 'That developer code was not recognized.');
      return;
    }
    setDevUnlockCode('');
    setShowDevUnlockEntry(false);
    await refresh();
    Alert.alert(
      result === 'activated' ? 'Developer unlock active' : 'Developer unlock disabled',
      result === 'activated'
        ? 'Pro Lifetime and Trip Planner Pro unlocked for testing on this device.'
        : 'Premium features now follow store purchases again.',
    );
  };

  const handleDisableDevUnlock = async () => {
    await disableDevUnlock();
    setShowDevUnlockEntry(false);
    setDevUnlockCode('');
    await refresh();
    Alert.alert('Developer unlock disabled', 'Premium features now follow store purchases again.');
  };

  const handleCheckPolicyUpdates = async () => {
    setPolicyCheckStatus('Checking…');
    try {
      const docs = await fetchAllPolicyVersions();
      setPolicyVersions(docs);
      const privacy = docs.privacy;
      setPolicyCheckStatus(
        privacy?.updatedAt
          ? `Privacy policy version ${privacy.version} (updated ${privacy.updatedAt.slice(0, 10)})`
          : `Policies available online (version ${privacy?.version ?? 'hosted'})`,
      );
    } catch {
      setPolicyCheckStatus('Could not reach Firebase. Open links below for hosted policies.');
    }
  };

  return (
    <KeyboardAwareScrollView
      extraBottomInset={insets.bottom}
      contentContainerStyle={[
        styles.container,
        { backgroundColor: theme.background, paddingBottom: insets.bottom + 24 },
      ]}>
      <ScreenHeader title="About & Legal" subtitle="Version, policies, and tester unlock" />

      <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <View style={styles.brandRow}>
          <Image source={require('@/assets/images/icon.png')} style={styles.icon} />
          <View style={styles.brandText}>
            <Text style={[styles.appName, { color: theme.text }]}>Totus Secure Notes</Text>
            <Text style={[styles.tagline, { color: theme.textMuted }]}>
              Local-first encrypted notes for clinical workflows
            </Text>
          </View>
        </View>

        <Pressable onPress={handleVersionTap} style={styles.versionRow}>
          <Text style={[styles.versionLabel, { color: theme.text }]}>Version {version}</Text>
          <Text style={[styles.versionHint, { color: theme.textMuted }]}>
            Tap {DEV_UNLOCK_VERSION_TAP_COUNT} times for tester unlock
          </Text>
          {versionCode ? (
            <Text style={[styles.buildMeta, { color: theme.textMuted }]}>
              Android build {versionCode}
              {packageName ? ` · ${packageName}` : ''}
            </Text>
          ) : null}
        </Pressable>

        {isStoreReviewMode() ? (
          <View style={[styles.banner, { backgroundColor: theme.successSurface }]}>
            <Text style={[styles.bannerText, { color: theme.success }]}>
              Store review mode — Pro features unlocked for app review.
            </Text>
          </View>
        ) : null}

        {monetization.devUnlockActive ? (
          <View style={[styles.banner, { backgroundColor: theme.surfaceSecondary }]}>
            <Text style={[styles.bannerText, { color: theme.textSecondary }]}>
              Developer unlock active — Pro Lifetime + Template AI for testing.
            </Text>
          </View>
        ) : null}

        {showDevUnlockEntry ? (
          <View style={styles.devUnlockBlock}>
            <Text style={[styles.body, { color: theme.textMuted }]}>
              Enter developer unlock code (testing only):
            </Text>
            <ThemedTextInput
              style={styles.input}
              value={devUnlockCode}
              onChangeText={setDevUnlockCode}
              placeholder="TOTUS-DEV-2026"
              autoCapitalize="characters"
              autoCorrect={false}
            />
            <Pressable
              style={[styles.button, { backgroundColor: theme.primary }]}
              onPress={handleDevUnlockSubmit}>
              <Text style={[styles.buttonText, { color: theme.primaryText }]}>Apply code</Text>
            </Pressable>
            <Pressable
              style={[styles.button, { backgroundColor: theme.surfaceSecondary }]}
              onPress={() => {
                setShowDevUnlockEntry(false);
                setDevUnlockCode('');
              }}>
              <Text style={[styles.secondaryButtonText, { color: theme.text }]}>Cancel</Text>
            </Pressable>
          </View>
        ) : null}

        {monetization.devUnlockActive ? (
          <Pressable
            style={[styles.button, { backgroundColor: theme.surfaceSecondary }]}
            onPress={handleDisableDevUnlock}>
            <Text style={[styles.secondaryButtonText, { color: theme.text }]}>Disable developer unlock</Text>
          </Pressable>
        ) : null}
      </View>

      <Text style={[styles.sectionHeading, { color: theme.text }]}>Policies & support</Text>
      <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <Pressable
          style={[styles.button, { backgroundColor: theme.surfaceSecondary }]}
          onPress={() => openPolicy(POLICY_URLS.support)}>
          <Text style={[styles.secondaryButtonText, { color: theme.text }]}>Contact support</Text>
        </Pressable>
        {POLICY_LINKS.map((link) => (
          <Pressable
            key={link.id}
            style={[styles.button, { backgroundColor: theme.surfaceSecondary }]}
            onPress={() => openPolicy(link.url, link.label)}>
            <Text style={[styles.secondaryButtonText, { color: theme.text }]}>{link.label}</Text>
          </Pressable>
        ))}
        <Pressable
          style={[styles.button, { backgroundColor: theme.primary }]}
          onPress={handleCheckPolicyUpdates}>
          <Text style={[styles.buttonText, { color: theme.primaryText }]}>Check for policy updates</Text>
        </Pressable>
        {policyCheckStatus ? (
          <Text style={[styles.body, { color: theme.textMuted }]}>{policyCheckStatus}</Text>
        ) : null}
        {policyVersions?.privacy?.version ? (
          <Text style={[styles.body, { color: theme.textMuted }]}>
            Firestore privacy version: {policyVersions.privacy.version}
          </Text>
        ) : null}
        <Pressable
          style={[styles.button, { backgroundColor: theme.surfaceSecondary }]}
          onPress={() => openPolicy(POLICY_URLS.home)}>
          <Text style={[styles.secondaryButtonText, { color: theme.text }]}>All policies (web index)</Text>
        </Pressable>
        <Pressable
          style={[styles.button, { backgroundColor: theme.surfaceSecondary }]}
          onPress={() => openPolicy(POLICY_URLS.legalDisclaimer, 'Legal disclaimer')}>
          <Text style={[styles.secondaryButtonText, { color: theme.text }]}>Legal disclaimer</Text>
        </Pressable>
      </View>
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 12 },
  card: { borderRadius: 12, padding: 16, gap: 10, borderWidth: 1 },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  icon: { width: 56, height: 56, borderRadius: 12 },
  brandText: { flex: 1 },
  appName: { fontSize: 18, fontWeight: '700' },
  tagline: { fontSize: 13, marginTop: 2 },
  versionRow: { paddingVertical: 8 },
  versionLabel: { fontSize: 20, fontWeight: '700' },
  versionHint: { fontSize: 13, marginTop: 4 },
  buildMeta: { fontSize: 12, marginTop: 4 },
  banner: { borderRadius: 8, padding: 10 },
  bannerText: { fontSize: 13, fontWeight: '600' },
  devUnlockBlock: { gap: 8 },
  sectionHeading: { fontSize: 18, fontWeight: '700', marginTop: 4 },
  body: { fontSize: 14, lineHeight: 21 },
  input: { paddingHorizontal: 12, paddingVertical: 10 },
  button: { borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  buttonText: { fontWeight: '600' },
  secondaryButtonText: { fontWeight: '600' },
});
