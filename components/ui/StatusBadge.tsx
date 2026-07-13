import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/context/ThemeContext';

export type StatusBadgeVariant = 'success' | 'warning' | 'info' | 'neutral';

type Props = {
  label: string;
  variant?: StatusBadgeVariant;
};

export default function StatusBadge({ label, variant = 'neutral' }: Props) {
  const { theme } = useAppTheme();

  const colors = {
    success: { bg: theme.successSurface, text: theme.success },
    warning: { bg: '#fef3c7', text: theme.flag },
    info: { bg: '#dbeafe', text: theme.primary },
    neutral: { bg: theme.surfaceSecondary, text: theme.textSecondary },
  }[variant];

  return (
    <View style={[styles.badge, { backgroundColor: colors.bg }]}>
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
  },
});
