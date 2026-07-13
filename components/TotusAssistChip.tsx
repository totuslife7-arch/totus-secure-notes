import { router } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/context/ThemeContext';
import { useMonetization } from '@/context/MonetizationContext';
import { hasTemplateAi } from '@/services/monetization';

type Props = {
  context: 'notes' | 'templates' | 'trips';
  onAssist?: () => void;
};

const CONTEXT_LABELS: Record<Props['context'], { label: string; hint: string }> = {
  notes: {
    label: 'Note Assist',
    hint: 'Bulletize, shorten, or summarize',
  },
  templates: {
    label: 'Template Assist',
    hint: 'AI or quick parse',
  },
  trips: {
    label: 'Trip Assist',
    hint: 'Route notes & summaries',
  },
};

export default function TotusAssistChip({ context, onAssist }: Props) {
  const { theme } = useAppTheme();
  const { state: monetization } = useMonetization();
  const entitled = hasTemplateAi(monetization);
  const meta = CONTEXT_LABELS[context];

  const handlePress = () => {
    if (onAssist) {
      onAssist();
      return;
    }
    if (context === 'templates') {
      router.push('/templates/studio/paste' as never);
      return;
    }
    if (context === 'notes') {
      router.push('/settings/totus-ai' as never);
      return;
    }
    router.push('/settings/totus-ai' as never);
  };

  return (
    <Pressable
      style={[styles.chip, { backgroundColor: theme.surface, borderColor: theme.border }]}
      onPress={handlePress}>
      <Text style={{ color: theme.primary, fontWeight: '700', fontSize: 13 }}>{meta.label}</Text>
      <Text style={{ color: theme.textMuted, fontSize: 11 }}>
        {entitled ? 'On-device' : 'Rules / Pro'} · {meta.hint}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 120,
  },
});
