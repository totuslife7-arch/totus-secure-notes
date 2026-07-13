import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInputProps, View } from 'react-native';

import ThemedTextInput from '@/components/ThemedTextInput';
import { useAppTheme } from '@/context/ThemeContext';

interface PasswordInputProps extends Omit<TextInputProps, 'secureTextEntry'> {
  containerStyle?: object;
}

export default function PasswordInput({ style, containerStyle, ...props }: PasswordInputProps) {
  const { theme } = useAppTheme();
  const [visible, setVisible] = useState(false);

  return (
    <View style={[styles.container, containerStyle]} collapsable={false}>
      <ThemedTextInput
        {...props}
        secureTextEntry={!visible}
        autoCapitalize="none"
        autoCorrect={false}
        textContentType="password"
        style={[styles.input, style]}
      />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={visible ? 'Hide password' : 'Show password'}
        onPress={() => setVisible((current) => !current)}
        style={[styles.toggle, { borderColor: theme.border, backgroundColor: theme.surfaceSecondary }]}>
        <Text style={[styles.toggleText, { color: theme.primary }]}>{visible ? 'Hide' : 'Show'}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  input: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  toggle: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    minWidth: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
