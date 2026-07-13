import { router } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import PaywallSheet from '@/components/PaywallSheet';
import { useAppTheme } from '@/context/ThemeContext';
import { useMonetization } from '@/context/MonetizationContext';
import { useTemplateAiReadiness } from '@/hooks/useTemplateAiReadiness';
import { hasTemplateAi } from '@/services/monetization';
import { getLastInferenceDiagnostic } from '@/services/templateAi/inferenceDiagnostics';
import { TEMPLATE_AI_MODEL } from '@/constants/templateAiConfig';
import {
  readinessStatusColor,
  readinessStatusLabel,
} from '@/services/templateAi/readinessUi';

export type CapabilityManifestItem = {
  id: string;
  title: string;
  description: string;
  where: string;
  tier: 'free' | 'pro' | 'coming';
  route?: string;
};

export const AI_CAPABILITY_MANIFEST: CapabilityManifestItem[] = [
  {
    id: 'quick-parse',
    title: 'Quick parse templates',
    description: 'Rule-based field extraction — no model download.',
    where: 'Template Studio',
    tier: 'free',
    route: '/templates/studio/paste',
  },
  {
    id: 'template-ai',
    title: 'Template AI field extraction',
    description: 'SmolLM2 extracts fields from pasted clinic forms on-device.',
    where: 'Studio → AI assist',
    tier: 'pro',
    route: '/templates/studio/paste',
  },
  {
    id: 'note-assist',
    title: 'Note Assist',
    description: 'Bulletize, shorten, expand, or summarize note text.',
    where: 'Note editor',
    tier: 'pro',
    route: '/notes',
  },
  {
    id: 'task-digest',
    title: 'Task digest (rules)',
    description: 'Summarize flagged notes, reminders, and open follow-ups.',
    where: 'Home / Notes',
    tier: 'free',
    route: '/home',
  },
  {
    id: 'task-digest-ai',
    title: 'Task digest AI summary',
    description: 'On-device AI summary atop the task digest banner.',
    where: 'Home / Notes',
    tier: 'pro',
    route: '/home',
  },
  {
    id: 'marketplace',
    title: 'Template library import',
    description: 'Browse curated public templates and customize locally.',
    where: 'Templates → Library',
    tier: 'free',
    route: '/templates/marketplace',
  },
  {
    id: 'attachments',
    title: 'Secure attachments',
    description: 'Encrypt photos and files inside your vault.',
    where: 'Note editor',
    tier: 'free',
    route: '/notes',
  },
  {
    id: 'trips',
    title: 'Trip GPS + maps',
    description: 'GPS mileage logging; Pro adds driving routes and in-app maps.',
    where: 'Trips',
    tier: 'free',
    route: '/trips',
  },
  {
    id: 'stt',
    title: 'Voice dictation',
    description: 'On-device speech-to-text for notes.',
    where: 'Notes',
    tier: 'coming',
  },
];

type Props = {
  compact?: boolean;
  onDownloadModel?: () => void;
  downloading?: boolean;
  onUpgrade?: () => void;
};

export default function TotusAiHubCard({ compact, onDownloadModel, downloading, onUpgrade }: Props) {
  const { theme } = useAppTheme();
  const { state: monetization } = useMonetization();
  const { readiness, modelBytes, loading } = useTemplateAiReadiness();
  const [paywallVisible, setPaywallVisible] = useState(false);
  const entitled = hasTemplateAi(monetization);

  const statusColor = readinessStatusColor(readiness);
  const statusText = loading ? 'Checking AI status…' : readinessStatusLabel(readiness);
  const dotColor =
    statusColor === 'ready' ? theme.success : statusColor === 'warn' ? '#b45309' : theme.danger;

  const openPaywall = () => {
    if (onUpgrade) {
      onUpgrade();
      return;
    }
    setPaywallVisible(true);
  };

  const handleCapabilityPress = (cap: CapabilityManifestItem) => {
    if (cap.tier === 'coming') {
      Alert.alert('Coming soon', `${cap.title} is planned for a future release.`);
      return;
    }
    if (cap.tier === 'pro' && !entitled) {
      openPaywall();
      return;
    }
    if (cap.route) {
      router.push(cap.route as never);
    }
  };

  if (compact) {
    return (
      <>
        <Pressable
          style={[styles.compactCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
          onPress={() => router.push('/settings/totus-ai' as never)}>
          <View style={styles.compactRow}>
            <View style={[styles.dot, { backgroundColor: dotColor }]} />
            <Text style={[styles.compactTitle, { color: theme.text }]}>Totus Assist</Text>
            {!entitled ? (
              <Text style={{ color: theme.primary, fontSize: 11, fontWeight: '600' }}>Pro</Text>
            ) : null}
          </View>
          <Text style={{ color: theme.textMuted, fontSize: 13 }} numberOfLines={2}>
            {statusText}
          </Text>
        </Pressable>
        <PaywallSheet visible={paywallVisible} premiumUpsell onClose={() => setPaywallVisible(false)} />
      </>
    );
  }

  return (
    <>
      <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <Text style={[styles.heading, { color: theme.text }]}>Totus Assist (on-device)</Text>
        <View style={styles.statusRow}>
          <View style={[styles.dot, { backgroundColor: dotColor }]} />
          <Text style={{ color: theme.textSecondary, flex: 1 }}>{statusText}</Text>
        </View>
        <Text style={{ color: theme.textMuted, fontSize: 13 }}>
          Model: {TEMPLATE_AI_MODEL.displayName}
          {readiness.modelReady ? ` · ${Math.round(modelBytes / 1_000_000)} MB` : ' · not downloaded'}
        </Text>
        {!entitled ? (
          <Pressable
            style={[styles.button, { backgroundColor: theme.primary }]}
            onPress={openPaywall}>
            <Text style={{ color: theme.primaryText, fontWeight: '600' }}>Upgrade to Pro Lifetime</Text>
          </Pressable>
        ) : null}
        {entitled && !readiness.canRun && onDownloadModel ? (
          <Pressable
            style={[styles.button, { backgroundColor: theme.primary, opacity: downloading ? 0.7 : 1 }]}
            onPress={onDownloadModel}
            disabled={downloading}>
            {downloading ? (
              <ActivityIndicator color={theme.primaryText} />
            ) : (
              <Text style={{ color: theme.primaryText, fontWeight: '600' }}>
                {readiness.modelReady ? 'Re-download model' : 'Download model (~240 MB)'}
              </Text>
            )}
          </Pressable>
        ) : null}

        <Text style={[styles.subheading, { color: theme.text }]}>What Totus Assist can do</Text>
        <View style={[styles.manifestHeader, { borderColor: theme.border }]}>
          <Text style={[styles.manifestCol, { color: theme.textMuted }]}>Capability</Text>
          <Text style={[styles.manifestTier, { color: theme.textMuted }]}>Free</Text>
          <Text style={[styles.manifestTier, { color: theme.textMuted }]}>Pro</Text>
        </View>
        {AI_CAPABILITY_MANIFEST.map((cap) => {
          const freeCheck = cap.tier === 'free';
          const proCheck = cap.tier === 'pro' || cap.tier === 'coming';
          return (
            <Pressable
              key={cap.id}
              style={[styles.capRow, { borderColor: theme.border }]}
              onPress={() => handleCapabilityPress(cap)}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: theme.text, fontWeight: '600' }}>{cap.title}</Text>
                <Text style={{ color: theme.textMuted, fontSize: 11 }}>{cap.where}</Text>
                <Text style={{ color: theme.textMuted, fontSize: 12, marginTop: 2 }}>
                  {cap.description}
                </Text>
              </View>
              <Text style={[styles.manifestTier, { color: freeCheck ? theme.success : theme.textMuted }]}>
                {freeCheck ? '✓' : cap.tier === 'coming' ? '—' : '·'}
              </Text>
              <Text
                style={[
                  styles.manifestTier,
                  {
                    color:
                      cap.tier === 'coming'
                        ? theme.textMuted
                        : proCheck
                          ? entitled
                            ? theme.success
                            : theme.primary
                          : theme.textMuted,
                  },
                ]}>
                {cap.tier === 'coming' ? 'Soon' : proCheck ? (entitled ? '✓' : 'Pro') : '·'}
              </Text>
            </Pressable>
          );
        })}
        <Text style={{ color: theme.textMuted, fontSize: 12, marginTop: 8 }}>
          Productivity assist only — not medical advice. Your notes never leave this device for AI.
        </Text>
      </View>
      <PaywallSheet visible={paywallVisible} premiumUpsell onClose={() => setPaywallVisible(false)} />
    </>
  );
}

export function TotusAiDiagnosticsPanel() {
  const { theme } = useAppTheme();
  const { state: monetization } = useMonetization();
  const { readiness, modelBytes } = useTemplateAiReadiness();
  const lastInference = getLastInferenceDiagnostic();
  const entitled = hasTemplateAi(monetization);

  const rows: { label: string; value: string; warn?: boolean }[] = [
    { label: 'Entitlement', value: entitled ? 'Pro Lifetime (or dev/review)' : 'Free — AI locked' },
    {
      label: 'canRun',
      value: readiness.canRun ? 'Yes' : 'No',
      warn: entitled && !readiness.canRun,
    },
    {
      label: 'Model on disk',
      value: readiness.modelReady
        ? `${Math.round(modelBytes / 1_000_000)} MB`
        : 'Not downloaded',
    },
    {
      label: 'Llama engine',
      value: readiness.llamaAvailable ? 'Initialized' : readiness.llamaError ?? 'Not ready',
      warn: !readiness.llamaAvailable && entitled,
    },
    {
      label: 'Expo Go',
      value: readiness.expoGo ? 'Yes (AI blocked)' : 'No',
      warn: readiness.expoGo,
    },
  ];

  if (lastInference) {
    rows.push({
      label: 'Last inference',
      value: `${lastInference.source} · ${lastInference.durationMs}ms · ${new Date(lastInference.at).toLocaleString()}`,
    });
    if (lastInference.error) {
      rows.push({ label: 'Last error', value: lastInference.error, warn: true });
    }
    if (lastInference.outputPreview) {
      rows.push({
        label: 'Output preview',
        value: lastInference.outputPreview.slice(0, 120) + (lastInference.outputPreview.length > 120 ? '…' : ''),
      });
    }
  }

  return (
    <View style={[styles.diagnostics, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <Text style={[styles.subheading, { color: theme.text, marginTop: 0 }]}>Diagnostics</Text>
      {rows.map((row) => (
        <View key={row.label} style={styles.diagRow}>
          <Text style={{ color: theme.textMuted, fontSize: 12, width: 110 }}>{row.label}</Text>
          <Text
            style={{
              color: row.warn ? theme.danger : theme.textSecondary,
              fontSize: 12,
              flex: 1,
            }}>
            {row.value}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 12, borderWidth: 1, padding: 14, gap: 8 },
  compactCard: { borderRadius: 12, borderWidth: 1, padding: 12, gap: 4, marginHorizontal: 16, marginBottom: 8 },
  compactRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  compactTitle: { fontSize: 15, fontWeight: '700', flex: 1 },
  heading: { fontSize: 17, fontWeight: '700' },
  subheading: { fontSize: 14, fontWeight: '600', marginTop: 8 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  button: { borderRadius: 10, paddingVertical: 12, alignItems: 'center', marginTop: 4 },
  manifestHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    paddingBottom: 6,
    marginTop: 4,
  },
  manifestCol: { flex: 1, fontSize: 11, fontWeight: '600' },
  manifestTier: { width: 36, textAlign: 'center', fontSize: 12, fontWeight: '600' },
  capRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  diagnostics: { borderRadius: 12, borderWidth: 1, padding: 14, marginTop: 16, gap: 6 },
  diagRow: { flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
});
