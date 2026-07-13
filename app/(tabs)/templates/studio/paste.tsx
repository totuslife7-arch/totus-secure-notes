import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import KeyboardAwareScrollView from '@/components/KeyboardAwareScrollView';
import PaywallSheet from '@/components/PaywallSheet';
import ThemedTextInput from '@/components/ThemedTextInput';
import { TEMPLATE_AI_MODEL } from '@/constants/templateAiConfig';
import { useAppTheme } from '@/context/ThemeContext';
import { useMonetization } from '@/context/MonetizationContext';
import { useTemplateAiReadiness } from '@/hooks/useTemplateAiReadiness';
import { hasTemplateAi } from '@/services/monetization';
import {
  generateTemplateDraft,
  getTemplateAiReadiness,
  TemplateAiError,
} from '@/services/templateAi/generateTemplateDraft';
import { isExpoGo, isNativeLlamaSupported } from '@/services/templateAi/llamaContext';
import { downloadModel } from '@/services/templateAi/modelManager';
import {
  readinessStatusColor,
  readinessStatusLabel,
  showTemplateAiFailure,
} from '@/services/templateAi/readinessUi';
import { parsePastedForm } from '@/services/templateStudio/parsePastedForm';
import { getBuiltinTemplate } from '@/store/builtinTemplates';

export default function TemplateStudioPasteScreen() {
  const { theme } = useAppTheme();
  const insets = useSafeAreaInsets();
  const { state: monetization } = useMonetization();
  const params = useLocalSearchParams<{ builtinId?: string; category?: string }>();
  const { readiness, modelBytes, refresh } = useTemplateAiReadiness();

  const builtinSeed = useMemo(
    () => (params.builtinId ? getBuiltinTemplate(params.builtinId) : undefined),
    [params.builtinId],
  );

  const [paste, setPaste] = useState('');
  const [title, setTitle] = useState(builtinSeed?.title ?? '');
  const [category, setCategory] = useState(params.category ?? builtinSeed?.category ?? 'Other');
  const [downloading, setDownloading] = useState(false);
  const [downloadFraction, setDownloadFraction] = useState(0);
  const [aiRunning, setAiRunning] = useState(false);
  const [paywallVisible, setPaywallVisible] = useState(false);
  const [aiStatusMessage, setAiStatusMessage] = useState<string | null>(null);

  const aiUnlocked = hasTemplateAi(monetization);
  const aiSupported = isNativeLlamaSupported();
  const expoGo = isExpoGo();

  useFocusEffect(
    useCallback(() => {
      refresh().catch(() => undefined);
    }, [refresh]),
  );

  const goToReview = (draft: string, source: 'ai' | 'rules') => {
    router.push({
      pathname: '/templates/studio/review' as never,
      params: {
        draft,
        source,
        paste,
        title,
        category,
        builtinId: params.builtinId ?? '',
      },
    });
  };

  const handleQuickParse = () => {
    if (!paste.trim()) {
      Alert.alert('Paste required', 'Paste your form text first.');
      return;
    }
    const draft = parsePastedForm(paste, { title: title || undefined, category });
    goToReview(JSON.stringify(draft), 'rules');
  };

  const ensureModelDownloaded = async (): Promise<boolean> => {
    let current = await getTemplateAiReadiness();
    if (current.modelReady) {
      await refresh();
      return true;
    }

    setDownloading(true);
    setDownloadFraction(0);
    setAiStatusMessage('Downloading on-device model (~240 MB)…');
    try {
      await downloadModel((p) => setDownloadFraction(p.fraction));
      await refresh();
      current = await getTemplateAiReadiness();
      if (!current.modelReady) {
        throw new Error('Model file incomplete after download.');
      }
      setAiStatusMessage('Model ready. Starting AI assist…');
      return true;
    } catch {
      setAiStatusMessage(null);
      Alert.alert(
        'Download failed',
        'Could not download the model. Check Wi‑Fi, storage space, and try again from Settings → Totus Assist.',
      );
      return false;
    } finally {
      setDownloading(false);
    }
  };

  const handleDownloadModel = async () => {
    if (!aiUnlocked) {
      setPaywallVisible(true);
      return;
    }
    const ok = await ensureModelDownloaded();
    if (ok) {
      setAiStatusMessage(null);
      Alert.alert('Ready', `${TEMPLATE_AI_MODEL.displayName} is on this device. Tap AI assist to run.`);
    }
  };

  const handleAiAssist = async () => {
    if (!paste.trim()) {
      Alert.alert('Paste required', 'Paste your form text first.');
      return;
    }
    if (!aiUnlocked) {
      setPaywallVisible(true);
      return;
    }
    if (expoGo) {
      Alert.alert(
        'Expo Go not supported',
        'Template AI requires a dev or production EAS build with llama.rn. Install a standalone build, then download the model in Settings → Totus Assist.',
      );
      return;
    }
    if (!aiSupported) {
      Alert.alert('Not supported', 'Template AI requires iOS or Android.');
      return;
    }

    setAiRunning(true);
    setAiStatusMessage(null);

    try {
      let current = await getTemplateAiReadiness();
      if (!current.canRun) {
        if (!current.modelReady) {
          const downloaded = await ensureModelDownloaded();
          if (!downloaded) return;
          current = await getTemplateAiReadiness();
        }
        if (!current.canRun) {
          const code = current.modelReady ? 'llama_init_failed' : 'model_missing';
          const msg =
            current.llamaError ??
            (code === 'model_missing'
              ? 'Download the on-device AI model first (~240 MB).'
              : 'Could not initialize the on-device AI engine.');
          throw new TemplateAiError(code, msg);
        }
      }

      const result = await generateTemplateDraft({
        paste,
        title: title || undefined,
        category,
        builtinSeed,
        onStatus: setAiStatusMessage,
        onToken: () => setAiStatusMessage('Running inference…'),
      });

      setAiStatusMessage(null);
      goToReview(JSON.stringify(result.draft), result.source);
    } catch (error) {
      if (error instanceof TemplateAiError && error.code === 'paywall') {
        setPaywallVisible(true);
        return;
      }
      await showTemplateAiFailure(error, {
        onQuickParse: handleQuickParse,
        onRedownload: handleDownloadModel,
        onOpenSettings: () => router.push('/settings/totus-ai' as never),
      });
    } finally {
      setAiRunning(false);
    }
  };

  const statusColor = readinessStatusColor(readiness);
  const dotColor =
    statusColor === 'ready' ? theme.success : statusColor === 'warn' ? '#b45309' : theme.danger;

  const modelStatusLabel = readiness.modelReady
    ? `Model ready (${Math.round(modelBytes / 1_000_000)} MB on device)`
    : readinessStatusLabel(readiness);

  return (
    <>
      <KeyboardAwareScrollView
        style={[styles.container, { backgroundColor: theme.background }]}
        extraBottomInset={insets.bottom}
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}>
        {builtinSeed ? (
          <Text style={[styles.hint, { color: theme.textMuted }]}>
            Adapting from built-in: {builtinSeed.title}. Paste your clinic form below.
          </Text>
        ) : null}

        {!aiUnlocked ? (
          <View style={[styles.upgradeCard, { backgroundColor: theme.primary, borderColor: theme.primary }]}>
            <Text style={[styles.upgradeTitle, { color: theme.primaryText }]}>
              Upgrade to Pro Lifetime
            </Text>
            <Text style={[styles.upgradeBody, { color: theme.primaryText }]}>
              Template AI runs on-device with SmolLM2. Quick parse (rules) is free — AI assist requires Pro
              Lifetime or the developer unlock code.
            </Text>
            <Pressable
              style={[styles.upgradeButton, { backgroundColor: theme.primaryText }]}
              onPress={() => setPaywallVisible(true)}>
              <Text style={{ color: theme.primary, fontWeight: '700' }}>View Pro plans</Text>
            </Pressable>
          </View>
        ) : null}

        <View style={[styles.compareRow, { borderColor: theme.border }]}>
          <View style={[styles.compareCol, { backgroundColor: theme.surface }]}>
            <Text style={{ color: theme.text, fontWeight: '600' }}>Quick parse</Text>
            <Text style={{ color: theme.textMuted, fontSize: 12 }}>Free · rules-based</Text>
          </View>
          <View style={[styles.compareCol, { backgroundColor: theme.surfaceSecondary }]}>
            <Text style={{ color: theme.text, fontWeight: '600' }}>AI assist</Text>
            <Text style={{ color: theme.textMuted, fontSize: 12 }}>Pro · on-device LLM</Text>
          </View>
        </View>

        <Text style={[styles.label, { color: theme.textSecondary }]}>Template title (optional)</Text>
        <ThemedTextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="Intake form" />

        <Text style={[styles.label, { color: theme.textSecondary }]}>Briefcase category</Text>
        <ThemedTextInput style={styles.input} value={category} onChangeText={setCategory} placeholder="Other" />

        <Text style={[styles.label, { color: theme.textSecondary }]}>Paste form text</Text>
        <ThemedTextInput
          style={[styles.input, styles.paste]}
          value={paste}
          onChangeText={setPaste}
          placeholder="Paste your intake or clinical form here…"
          multiline
          scrollEnabled={false}
          textAlignVertical="top"
        />

        <View style={[styles.modelCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={styles.statusRow}>
            <View style={[styles.dot, { backgroundColor: dotColor }]} />
            <Text style={[styles.modelTitle, { color: theme.text }]}>On-device AI</Text>
          </View>
          <Text style={[styles.modelMeta, { color: theme.textMuted }]}>
            {TEMPLATE_AI_MODEL.displayName} · ~240 MB · runs locally
          </Text>
          <Text style={[styles.modelMeta, { color: theme.textMuted }]}>{modelStatusLabel}</Text>
          {expoGo ? (
            <Text style={[styles.modelMeta, { color: '#b45309' }]}>
              Requires a production or dev build — not Expo Go.
            </Text>
          ) : null}
          {aiStatusMessage ? (
            <Text style={[styles.modelMeta, { color: theme.textSecondary }]}>{aiStatusMessage}</Text>
          ) : null}
          {downloading ? (
            <View style={styles.progressRow}>
              <ActivityIndicator color={theme.primary} />
              <Text style={{ color: theme.textMuted, marginLeft: 8 }}>
                Downloading… {Math.round(downloadFraction * 100)}%
              </Text>
            </View>
          ) : !readiness.modelReady && aiSupported && !expoGo && aiUnlocked ? (
            <Pressable
              style={[styles.secondaryButton, { borderColor: theme.border }]}
              onPress={handleDownloadModel}>
              <Text style={{ color: theme.text, fontWeight: '600' }}>Download model</Text>
            </Pressable>
          ) : null}
          <Text style={[styles.disclaimer, { color: theme.textMuted }]}>
            Productivity assist only — not medical advice. Review every field before saving.
          </Text>
        </View>

        <Pressable
          style={[styles.button, { backgroundColor: theme.surfaceSecondary, borderColor: theme.border, borderWidth: 1 }]}
          onPress={handleQuickParse}>
          <Text style={{ color: theme.text, fontWeight: '600' }}>Quick parse (rules)</Text>
        </Pressable>

        <Pressable
          style={[styles.button, { backgroundColor: theme.primary, opacity: aiRunning ? 0.7 : 1 }]}
          onPress={handleAiAssist}
          disabled={aiRunning || downloading}>
          {aiRunning ? (
            <ActivityIndicator color={theme.primaryText} />
          ) : (
            <Text style={{ color: theme.primaryText, fontWeight: '600' }}>
              {aiUnlocked ? 'AI assist (on-device)' : 'AI assist (Pro Lifetime)'}
            </Text>
          )}
        </Pressable>
      </KeyboardAwareScrollView>

      <PaywallSheet visible={paywallVisible} premiumUpsell onClose={() => setPaywallVisible(false)} />
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  hint: { fontSize: 14, marginBottom: 12 },
  upgradeCard: { borderRadius: 12, borderWidth: 1, padding: 16, marginBottom: 12, gap: 8 },
  upgradeTitle: { fontSize: 17, fontWeight: '700' },
  upgradeBody: { fontSize: 13, opacity: 0.95, lineHeight: 18 },
  upgradeButton: { borderRadius: 10, paddingVertical: 12, alignItems: 'center', marginTop: 4 },
  compareRow: { flexDirection: 'row', gap: 8, marginBottom: 12, borderBottomWidth: 0 },
  compareCol: { flex: 1, borderRadius: 10, padding: 10, gap: 2 },
  label: { fontSize: 13, fontWeight: '500', marginBottom: 4, marginTop: 8 },
  input: { minHeight: 44, marginBottom: 8 },
  paste: { minHeight: 220 },
  modelCard: { borderRadius: 12, borderWidth: 1, padding: 14, marginVertical: 12, gap: 6 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  modelTitle: { fontSize: 15, fontWeight: '600' },
  modelMeta: { fontSize: 13 },
  disclaimer: { fontSize: 12, marginTop: 4 },
  progressRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  button: { borderRadius: 10, paddingVertical: 14, alignItems: 'center', marginTop: 10 },
  secondaryButton: { borderRadius: 10, paddingVertical: 10, alignItems: 'center', marginTop: 6, borderWidth: 1 },
});
