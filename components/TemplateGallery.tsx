import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import ProUpgradeBanner from '@/components/ProUpgradeBanner';
import { useAppTheme } from '@/context/ThemeContext';
import TotusAssistChip from '@/components/TotusAssistChip';
import { useMonetization } from '@/context/MonetizationContext';
import { useVault } from '@/context/VaultContext';
import { usePinnedTemplates } from '@/hooks/usePinnedTemplates';
import { hasTemplateStudio } from '@/services/monetization';
import { listCustomTemplates } from '@/services/templateStudio/templateStorage';
import { CustomTemplateDefinition } from '@/store/customTemplateSchema';
import {
  ALL_TEMPLATES,
  BUILTIN_CATEGORIES,
  BUILTIN_TEMPLATE_DEFINITIONS,
  TemplateDefinition,
} from '@/store/templates';

interface TemplateGalleryProps {
  onSelectMarkdown?: (template: TemplateDefinition) => void;
}

export default function TemplateGallery({ onSelectMarkdown }: TemplateGalleryProps) {
  const { theme } = useAppTheme();
  const { state } = useMonetization();
  const { sessionPassword } = useVault();
  const { refs: pinnedRefs, pin, unpin } = usePinnedTemplates(sessionPassword);
  const studioUnlocked = hasTemplateStudio(state);
  const [briefcaseTemplates, setBriefcaseTemplates] = useState<CustomTemplateDefinition[]>([]);

  const loadBriefcase = useCallback(async () => {
    if (!sessionPassword || !studioUnlocked) {
      setBriefcaseTemplates([]);
      return;
    }
    const list = await listCustomTemplates(sessionPassword);
    setBriefcaseTemplates(list);
  }, [sessionPassword, studioUnlocked]);

  useFocusEffect(
    useCallback(() => {
      loadBriefcase().catch(() => undefined);
    }, [loadBriefcase]),
  );

  const isPinned = (kind: 'form' | 'builtin' | 'custom', id: string) =>
    pinnedRefs.some((ref) => ref.kind === kind && ref.id === id);

  const togglePin = (kind: 'form' | 'builtin' | 'custom', id: string) => {
    const ref = { kind, id };
    if (isPinned(kind, id)) {
      unpin(ref).catch(() => undefined);
    } else {
      pin(ref).catch(() => undefined);
    }
  };

  const handlePress = (template: TemplateDefinition) => {
    if ((template.type === 'form' || template.type === 'builtin') && template.route) {
      router.push(template.route as '/templates/postpartum');
      return;
    }

    onSelectMarkdown?.(template);
  };

  const markdownTemplates = ALL_TEMPLATES.filter((t) => t.type === 'markdown');
  const formTemplates = ALL_TEMPLATES.filter((t) => t.type === 'form');

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled">
      <ProUpgradeBanner context="templates" />
      <Text style={[styles.heading, { color: theme.text }]}>Choose a Template</Text>
      <View style={styles.assistRow}>
        <TotusAssistChip context="templates" />
      </View>

      {formTemplates.length > 0 ? (
        <>
          <Text style={[styles.sectionHeading, { color: theme.text }]}>Clinical forms</Text>
          <Text style={[styles.sectionHint, { color: theme.textMuted }]}>
            Dedicated workflows — fill fields and copy into your EMR.
          </Text>
          {formTemplates.map((item) => (
            <Pressable
              key={item.id}
              style={[styles.row, styles.featuredRow, { backgroundColor: theme.surface, borderColor: theme.primary }]}
              onPress={() => handlePress(item)}>
              <View style={styles.rowHeader}>
                <Text style={[styles.title, { color: theme.text }]}>{item.title}</Text>
                {isPinned('form', item.id) ? (
                  <Text style={[styles.badge, styles.badgeFeatured]}>★ Pinned</Text>
                ) : null}
              </View>
              <Text style={[styles.description, { color: theme.textMuted }]}>{item.description}</Text>
              {item.id === 'sofo_postpartum_hv' ? (
                <Text style={[styles.featuredHint, { color: theme.primary }]}>
                  Used by SoFo nurses — voice fill, copy to EMR
                </Text>
              ) : null}
              <Pressable
                style={styles.pinAction}
                onPress={(event) => {
                  event.stopPropagation();
                  togglePin('form', item.id);
                }}>
                <Text style={{ color: theme.primary, fontWeight: '600', fontSize: 13 }}>
                  {isPinned('form', item.id) ? 'Unpin from Home' : 'Pin to Home'}
                </Text>
              </Pressable>
            </Pressable>
          ))}
        </>
      ) : null}

      <Pressable
        style={[styles.studioRow, { backgroundColor: theme.surface, borderColor: theme.border }]}
        onPress={() => router.push('/templates/studio/index' as never)}>
        <View style={styles.rowHeader}>
          <Text style={[styles.title, { color: theme.text }]}>Template Studio</Text>
          <Text style={[styles.badge, studioUnlocked ? styles.badgePro : styles.badgeLocked]}>
            {studioUnlocked ? 'Briefcase' : 'Pro+'}
          </Text>
        </View>
        <Text style={[styles.description, { color: theme.textMuted }]}>
          Paste intake forms, build reusable templates, organize your briefcase.
        </Text>
      </Pressable>

      {studioUnlocked && briefcaseTemplates.length > 0 ? (
        <>
          <Text style={[styles.sectionHeading, { color: theme.text }]}>My briefcase</Text>
          <Text style={[styles.sectionHint, { color: theme.textMuted }]}>
            Saved templates — pin any to Home for one-tap access.
          </Text>
          {briefcaseTemplates.map((item) => (
            <Pressable
              key={item.id}
              style={[styles.row, { backgroundColor: theme.surface, borderColor: theme.border }]}
              onPress={() => router.push(`/templates/studio/${item.id}` as never)}>
              <View style={styles.rowHeader}>
                <Text style={[styles.title, { color: theme.text }]}>{item.title}</Text>
                {isPinned('custom', item.id) ? (
                  <Text style={[styles.badge, styles.badgeFeatured]}>★ Pinned</Text>
                ) : (
                  <Text style={[styles.badge, styles.badgePro]}>Custom</Text>
                )}
              </View>
              <Text style={[styles.description, { color: theme.textMuted }]}>
                {item.category ?? 'Other'} · {item.sections.length} section(s)
              </Text>
              <Pressable
                style={styles.pinAction}
                onPress={(event) => {
                  event.stopPropagation();
                  togglePin('custom', item.id);
                }}>
                <Text style={{ color: theme.primary, fontWeight: '600', fontSize: 13 }}>
                  {isPinned('custom', item.id) ? 'Unpin from Home' : 'Pin to Home'}
                </Text>
              </Pressable>
            </Pressable>
          ))}
        </>
      ) : null}

      <Text style={[styles.sectionHeading, { color: theme.text }]}>Built-in briefcase</Text>
      <Text style={[styles.sectionHint, { color: theme.textMuted }]}>
        Clinical starters — copy for EMR, save to briefcase, or adapt from your clinic form.
      </Text>

      {BUILTIN_CATEGORIES.map((category) => {
        const items = BUILTIN_TEMPLATE_DEFINITIONS.filter((t) => t.category === category);
        if (!items.length) return null;
        return (
          <View key={category} style={styles.categoryBlock}>
            <Text style={[styles.categoryTitle, { color: theme.textSecondary }]}>{category}</Text>
            {items.map((item) => (
              <Pressable
                key={item.id}
                style={[styles.row, { backgroundColor: theme.surface, borderColor: theme.border }]}
                onPress={() => handlePress(item)}>
                <View style={styles.rowHeader}>
                  <Text style={[styles.title, { color: theme.text }]}>{item.title}</Text>
                  <Text style={[styles.badge, styles.badgeBuiltin]}>Built-in</Text>
                </View>
                <Text style={[styles.description, { color: theme.textMuted }]}>{item.description}</Text>
              </Pressable>
            ))}
          </View>
        );
      })}

      <Text style={[styles.sectionHeading, { color: theme.text }]}>Markdown</Text>
      <FlatList
        data={markdownTemplates}
        scrollEnabled={false}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable
            style={[styles.row, { backgroundColor: theme.surface, borderColor: theme.border }]}
            onPress={() => handlePress(item)}>
            <View style={styles.rowHeader}>
              <Text style={[styles.title, { color: theme.text }]}>{item.title}</Text>
              <Text style={styles.badge}>Markdown</Text>
            </View>
            <Text style={[styles.description, { color: theme.textMuted }]}>{item.description}</Text>
          </Pressable>
        )}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
    paddingBottom: 32,
  },
  heading: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
  },
  assistRow: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 4,
  },
  sectionHint: {
    fontSize: 13,
    marginBottom: 12,
  },
  categoryBlock: {
    marginBottom: 8,
  },
  categoryTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  studioRow: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  row: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  featuredRow: {
    borderWidth: 2,
  },
  rowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    flex: 1,
  },
  badge: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2563eb',
    backgroundColor: '#dbeafe',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    overflow: 'hidden',
  },
  badgePro: {
    color: '#047857',
    backgroundColor: '#d1fae5',
  },
  badgeLocked: {
    color: '#92400e',
    backgroundColor: '#fef3c7',
  },
  badgeBuiltin: {
    color: '#4338ca',
    backgroundColor: '#e0e7ff',
  },
  badgeFeatured: {
    color: '#1d4ed8',
    backgroundColor: '#dbeafe',
  },
  description: {
    fontSize: 14,
  },
  featuredHint: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 6,
  },
  pinAction: {
    marginTop: 8,
  },
});
