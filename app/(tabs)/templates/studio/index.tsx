import { router } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';

import KeyboardAwareScrollView from '@/components/KeyboardAwareScrollView';
import PaywallSheet from '@/components/PaywallSheet';
import { useAppTheme } from '@/context/ThemeContext';
import { useMonetization } from '@/context/MonetizationContext';
import { useVault } from '@/context/VaultContext';
import { usePinnedTemplates } from '@/hooks/usePinnedTemplates';
import { hasTemplateStudio } from '@/services/monetization';
import { listCustomTemplates } from '@/services/templateStudio/templateStorage';
import { CustomTemplateDefinition } from '@/store/customTemplateSchema';

export default function TemplateStudioHomeScreen() {
  const { theme } = useAppTheme();
  const { state } = useMonetization();
  const { sessionPassword } = useVault();
  const { refs: pinnedRefs, pin, unpin } = usePinnedTemplates(sessionPassword);
  const [templates, setTemplates] = useState<CustomTemplateDefinition[]>([]);
  const [paywallVisible, setPaywallVisible] = useState(false);

  const unlocked = hasTemplateStudio(state);

  const load = useCallback(async () => {
    if (!sessionPassword || !unlocked) return;
    const list = await listCustomTemplates(sessionPassword);
    setTemplates(list);
  }, [sessionPassword, unlocked]);

  useFocusEffect(
    useCallback(() => {
      if (unlocked) {
        load();
      }
    }, [load, unlocked]),
  );

  if (!unlocked) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={[styles.heading, { color: theme.text }]}>Template Studio</Text>
        <Text style={[styles.body, { color: theme.textMuted }]}>
          Build reusable templates from pasted intake forms and organize your briefcase.
        </Text>
        <Pressable
          style={[styles.cta, { backgroundColor: theme.primary }]}
          onPress={() => setPaywallVisible(true)}>
          <Text style={{ color: theme.primaryText, fontWeight: '600' }}>Unlock Template Studio</Text>
        </Pressable>
        <PaywallSheet
          visible={paywallVisible}
          premiumUpsell
          onClose={() => setPaywallVisible(false)}
          onPurchased={load}
        />
      </View>
    );
  }

  return (
    <KeyboardAwareScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.heading, { color: theme.text }]}>Template Studio</Text>
      <Text style={[styles.body, { color: theme.textMuted }]}>
        Paste a form, review fields, save to your encrypted briefcase.
      </Text>

      <Pressable
        style={[styles.cta, { backgroundColor: theme.primary }]}
        onPress={() => router.push('/templates/studio/paste' as never)}>
        <Text style={{ color: theme.primaryText, fontWeight: '600' }}>Paste new form</Text>
      </Pressable>

      <Text style={[styles.subheading, { color: theme.text }]}>My templates</Text>
      {templates.length === 0 ? (
        <View style={{ gap: 8 }}>
          <Text style={{ color: theme.textMuted }}>No custom templates yet.</Text>
          <Pressable onPress={() => router.push('/settings/totus-ai' as never)}>
            <Text style={{ color: theme.primary, fontWeight: '600' }}>Set up Totus Assist →</Text>
          </Pressable>
        </View>
      ) : (
        templates.map((tpl) => {
          const pinned = pinnedRefs.some((ref) => ref.kind === 'custom' && ref.id === tpl.id);
          return (
          <Pressable
            key={tpl.id}
            style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}
            onPress={() => router.push(`/templates/studio/${tpl.id}` as never)}>
            <View style={styles.cardHeader}>
              <Text style={[styles.cardTitle, { color: theme.text }]}>{tpl.title}</Text>
              <Pressable
                onPress={(event) => {
                  event.stopPropagation();
                  const ref = { kind: 'custom' as const, id: tpl.id };
                  if (pinned) {
                    unpin(ref).catch(() => undefined);
                  } else {
                    pin(ref).catch(() => undefined);
                  }
                }}>
                <Text style={{ color: theme.primary, fontWeight: '600', fontSize: 13 }}>
                  {pinned ? 'Unpin from Home' : 'Pin to Home'}
                </Text>
              </Pressable>
            </View>
            <Text style={{ color: theme.textMuted, fontSize: 13 }}>
              {tpl.category ?? 'Other'} · {tpl.sections.length} section(s)
            </Text>
          </Pressable>
        );
        })
      )}
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  heading: { fontSize: 22, fontWeight: '700', marginBottom: 8 },
  subheading: { fontSize: 17, fontWeight: '600', marginTop: 24, marginBottom: 12 },
  body: { fontSize: 15, lineHeight: 22, marginBottom: 16 },
  cta: { borderRadius: 10, paddingVertical: 14, alignItems: 'center', marginBottom: 8 },
  card: { borderRadius: 12, borderWidth: 1, padding: 14, marginBottom: 10 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 4 },
  cardTitle: { fontSize: 16, fontWeight: '600', flex: 1 },
});
