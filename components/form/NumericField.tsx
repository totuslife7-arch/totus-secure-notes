import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import ThemedTextInput from '@/components/ThemedTextInput';
import { useAppTheme } from '@/context/ThemeContext';
import { digitsOnly } from '@/utils/formInputFilters';

interface NumericFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  suffix?: string;
}

export default function NumericField({
  label,
  value,
  onChangeText,
  placeholder,
  suffix,
}: NumericFieldProps) {
  const { theme } = useAppTheme();

  return (
    <View style={styles.field}>
      <Text style={[styles.label, { color: theme.textSecondary }]}>{label}</Text>
      <View style={styles.row}>
        <ThemedTextInput
          style={[styles.input, suffix ? styles.inputWithSuffix : undefined]}
          value={value}
          onChangeText={(text) => onChangeText(digitsOnly(text))}
          placeholder={placeholder}
          keyboardType="number-pad"
        />
        {suffix ? <Text style={[styles.suffix, { color: theme.textMuted }]}>{suffix}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    marginBottom: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  input: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    borderWidth: 0,
  },
  inputWithSuffix: {
    flex: 1,
  },
  suffix: {
    fontSize: 13,
  },
});
