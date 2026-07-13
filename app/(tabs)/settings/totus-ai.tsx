import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import AiOnboardingSheet from '@/components/AiOnboardingSheet';
import KeyboardAwareScrollView from '@/components/KeyboardAwareScrollView';
import PaywallSheet from '@/components/PaywallSheet';
import TotusAiHubCard, { TotusAiDiagnosticsPanel } from '@/components/TotusAiHubCard';
import { useAppTheme } from '@/context/ThemeContext';
import { useMonetization } from '@/context/MonetizationContext';
import { useTemplateAiReadiness } from '@/hooks/useTemplateAiReadiness';
import { hasTemplateAi } from '@/services/monetization';
import { downloadModel } from '@/services/templateAi/modelManager';
import { shouldShowAiOnboarding } from '@/components/AiOnboardingSheet';

export default function TotusAiSettingsScreen() {
  const { theme } = useAppTheme();
  const insets = useSafeAreaInsets();
  const { state: monetization } = useMonetization();
  const { readiness, refresh } = useTemplateAiReadiness();
  const [downloading, setDownloading] = useState(false);
  const [downloadPct, setDownloadPct] = useState(0);
  const [paywallVisible, setPaywallVisible] = useState(false);
  const [onboardingVisible, setOnboardingVisible] = useState(false);

  useFocusEffect(
    useCallback(() => {
      shouldShowAiOnboarding()
        .then((show) => {
          if (show && readiness.canRun) setOnboardingVisible(true);
        })
        .catch(() => undefined);
    }, [readiness.canRun]),
  );

  const handleDownload = async () => {
    if (!hasTemplateAi(monetization)) {
      setPaywallVisible(true);
      return;
    }
    setDownloading(true);
    try {
      await downloadModel((p) => setDownloadPct(p.fraction));
      await refresh();
      Alert.alert('Ready', 'On-device model is on this device. Open Template Studio → AI assist.');
      const show = await shouldShowAiOnboarding();
      if (show) setOnboardingVisible(true);
    } catch {
      Alert.alert('Download failed', 'Check Wi‑Fi and storage, then try again.');
    } finally {
      setDownloading(false);
      setDownloadPct(0);
    }
  };

  return (
    <>
      <KeyboardAwareScrollView
        style={[styles.container, { backgroundColor: theme.background }]}
        extraBottomInset={insets.bottom}
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}>
        <Text style={[styles.pageTitle, { color: theme.text }]}>Totus Assist</Text>
        <Text style={{ color: theme.textMuted, marginBottom: 16 }}>
          On-device AI for templates and notes. Nothing is sent to the cloud.
        </Text>

        <TotusAiHubCard
          onDownloadModel={handleDownload}
          downloading={downloading}
          onUpgrade={() => setPaywallVisible(true)}
        />

        <TotusAiDiagnosticsPanel />

        {downloading ? (
          <Text style={{ color: theme.textSecondary, marginTop: 8 }}>
            Downloading… {Math.round(downloadPct * 100)}%
          </Text>
        ) : null}

        <View style={[styles.section, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Developer unlock</Text>
          <Text style={{ color: theme.textMuted, fontSize: 13 }}>
            Settings → About → tap version 7 times → enter TOTUS-DEV-2026 for full Pro testing.
          </Text>
          {monetization.devUnlockActive ? (
            <Text style={{ color: theme.success, fontWeight: '600', marginTop: 8 }}>
              Developer unlock active
            </Text>
          ) : null}
        </View>

        <View style={[styles.section, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Secure media</Text>
          <Text style={{ color: theme.textMuted, fontSize: 13 }}>
            Photos and media imported into notes are encrypted in your vault. When possible, the
            original is removed from your gallery. Secure delete shreds vault copies — platform
            limits may apply on some devices.
          </Text>
        </View>

        <View style={[styles.section, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Troubleshooting</Text>
          <Text style={{ color: theme.textMuted, fontSize: 13 }}>
            1. Use an EAS build — not Expo Go.{'\n'}
            2. Unlock Pro Lifetime or developer code.{'\n'}
            3. Download model here (~240 MB).{'\n'}
            4. Template Studio → paste form → AI assist.{'\n'}
            5. If AI engine fails, re-download the model.
          </Text>
          {readiness.llamaError ? (
            <Text style={{ color: theme.danger, fontSize: 13, marginTop: 8 }}>
              Last error: {readiness.llamaError}
            </Text>
          ) : null}
        </View>

        <Pressable
          style={[styles.linkButton, { borderColor: theme.border }]}
          onPress={() => router.push('/templates/marketplace' as never)}>
          <Text style={{ color: theme.primary, fontWeight: '600' }}>Browse template library</Text>
        </Pressable>
      </KeyboardAwareScrollView>

      <PaywallSheet visible={paywallVisible} onClose={() => setPaywallVisible(false)} />
      <AiOnboardingSheet
        visible={onboardingVisible}
        onClose={() => setOnboardingVisible(false)}
        onTryTemplateAi={() => {
          setOnboardingVisible(false);
          router.push('/templates/studio/paste' as never);
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  pageTitle: { fontSize: 24, fontWeight: '700', marginBottom: 4 },
  section: { borderRadius: 12, borderWidth: 1, padding: 14, marginTop: 16, gap: 6 },
  sectionTitle: { fontSize: 15, fontWeight: '600' },
  linkButton: {
    borderRadius: 10,
    borderWidth: 1,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 16,
  },
});
