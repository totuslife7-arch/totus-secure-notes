import { router, useLocalSearchParams } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import KeyboardAwareScrollView from '@/components/KeyboardAwareScrollView';
import ThemedTextInput from '@/components/ThemedTextInput';
import { useAppTheme } from '@/context/ThemeContext';
import { useVault } from '@/context/VaultContext';
import {
  generateTemplateDraft,
  templateAiErrorMessage,
  templateAiErrorTitle,
  TemplateAiError,
} from '@/services/templateAi/generateTemplateDraft';
import { upsertCustomTemplate } from '@/services/templateStudio/templateStorage';
import { CustomTemplateDefinition } from '@/store/customTemplateSchema';

export default function TemplateStudioReviewScreen() {
  const { theme } = useAppTheme();
  const { sessionPassword } = useVault();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    draft?: string;
    source?: string;
    paste?: string;
    title?: string;
    category?: string;
    builtinId?: string;
  }>();

  const initial = useMemo(() => {
    try {
      return JSON.parse(params.draft ?? '{}') as CustomTemplateDefinition;
    } catch {
      return null;
    }
  }, [params.draft]);

  const [draft, setDraft] = useState<CustomTemplateDefinition | null>(initial);
  const [source, setSource] = useState<'ai' | 'rules'>(
    params.source === 'ai' ? 'ai' : 'rules',
  );
  const [rerunning, setRerunning] = useState(false);

  if (!draft) {
    return (
      <View style={styles.centered}>
        <Text>Invalid template draft.</Text>
      </View>
    );
  }

  const updateTitle = (title: string) => setDraft({ ...draft, title });

  const updateFieldLabel = (sectionId: string, fieldId: string, label: string) => {
    setDraft({
      ...draft,
      sections: draft.sections.map((s) =>
        s.id === sectionId
          ? {
              ...s,
              fields: s.fields.map((f) => (f.id === fieldId ? { ...f, label } : f)),
            }
          : s,
      ),
    });
  };

  const handleSave = async () => {
    if (!sessionPassword) {
      Alert.alert('Locked', 'Unlock your vault first.');
      return;
    }
    await upsertCustomTemplate(sessionPassword, draft);
    Alert.alert('Saved', 'Template added to your briefcase.', [
      { text: 'OK', onPress: () => router.replace('/templates/studio/index' as never) },
    ]);
  };

  const handleRerunAi = async () => {
    const paste = params.paste?.trim();
    if (!paste) {
      Alert.alert('Cannot re-run', 'Original paste text was not passed to this screen.');
      return;
    }
    setRerunning(true);
    try {
      const result = await generateTemplateDraft({
        paste,
        title: params.title || draft.title,
        category: params.category || draft.category,
      });
      setDraft(result.draft);
      setSource(result.source);
    } catch (error) {
      const title =
        error instanceof TemplateAiError
          ? templateAiErrorTitle(error.code)
          : 'AI unavailable';
      Alert.alert(title, templateAiErrorMessage(error));
    } finally {
      setRerunning(false);
    }
  };

  return (
    <KeyboardAwareScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      extraBottomInset={insets.bottom}
      contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}>
      <View style={styles.badgeRow}>
        <Text
          style={[
            styles.badge,
            source === 'ai' ? styles.badgeAi : styles.badgeRules,
          ]}>
          {source === 'ai' ? 'AI draft' : 'Rules parse'}
        </Text>
        {params.paste ? (
          <Pressable onPress={handleRerunAi} disabled={rerunning}>
            <Text style={{ color: theme.primary, fontWeight: '600' }}>
              {rerunning ? 'Re-running…' : 'Re-run AI'}
            </Text>
          </Pressable>
        ) : null}
      </View>

      <Text style={[styles.label, { color: theme.textSecondary }]}>Template name</Text>
      <ThemedTextInput style={styles.input} value={draft.title} onChangeText={updateTitle} />

      {draft.sections.map((section) => (
        <View key={section.id} style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>{section.title}</Text>
          {section.fields.map((field) => (
            <View key={field.id} style={styles.fieldRow}>
              <ThemedTextInput
                style={styles.input}
                value={field.label}
                onChangeText={(label) => updateFieldLabel(section.id, field.id, label)}
              />
              <Text style={{ color: theme.textMuted, fontSize: 12 }}>{field.type}</Text>
            </View>
          ))}
        </View>
      ))}

      <Pressable style={[styles.button, { backgroundColor: theme.primary }]} onPress={handleSave}>
        <Text style={{ color: theme.primaryText, fontWeight: '600' }}>Save to briefcase</Text>
      </Pressable>
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  badgeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  badge: { fontSize: 12, fontWeight: '600', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, overflow: 'hidden' },
  badgeAi: { color: '#1d4ed8', backgroundColor: '#dbeafe' },
  badgeRules: { color: '#047857', backgroundColor: '#d1fae5' },
  label: { fontSize: 13, marginBottom: 4 },
  input: { minHeight: 44, marginBottom: 8 },
  section: { marginTop: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
  fieldRow: { marginBottom: 10 },
  button: { borderRadius: 10, paddingVertical: 14, alignItems: 'center', marginTop: 20, marginBottom: 32 },
});
