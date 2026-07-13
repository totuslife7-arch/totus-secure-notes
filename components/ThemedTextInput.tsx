import React, { useRef } from 'react';
import { StyleSheet, TextInput, TextInputProps, View } from 'react-native';

import { useKeyboardAwareScrollContext } from '@/components/KeyboardAwareScrollView';
import { useAppTheme } from '@/context/ThemeContext';

export default function ThemedTextInput({
  style,
  multiline,
  scrollEnabled,
  onFocus,
  onContentSizeChange,
  ...props
}: TextInputProps) {
  const { theme, isDark } = useAppTheme();
  const wrapperRef = useRef<View>(null);
  const keyboardScroll = useKeyboardAwareScrollContext();

  const effectiveScrollEnabled = multiline ? (scrollEnabled ?? false) : scrollEnabled;

  return (
    <View ref={wrapperRef} collapsable={false}>
      <TextInput
        {...props}
        multiline={multiline}
        scrollEnabled={effectiveScrollEnabled}
        placeholderTextColor={props.placeholderTextColor ?? theme.placeholder}
        keyboardAppearance={isDark ? 'dark' : 'light'}
        onFocus={(event) => {
          onFocus?.(event);
          keyboardScroll?.notifyInputFocus(wrapperRef.current);
        }}
        onContentSizeChange={(event) => {
          onContentSizeChange?.(event);
          if (multiline) {
            keyboardScroll?.notifyContentSizeChange(wrapperRef.current);
          }
        }}
        style={[
          styles.base,
          {
            color: theme.inputText,
            backgroundColor: theme.inputBackground,
            borderColor: theme.border,
          },
          style,
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderWidth: 1,
    borderRadius: 10,
  },
});
