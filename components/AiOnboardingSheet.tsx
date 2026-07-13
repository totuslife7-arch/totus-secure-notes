import * as SecureStore from 'expo-secure-store';
import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/context/ThemeContext';

const ONBOARDING_KEY = 'totus_ai_onboarding_seen';

export async function shouldShowAiOnboarding(): Promise<boolean> {
  const seen = await SecureStore.getItemAsync(ONBOARDING_KEY);
  return seen !== '1';
}

export async function markAiOnboardingSeen(): Promise<void> {
  await SecureStore.setItemAsync(ONBOARDING_KEY, '1');
}

type Props = {
  visible: boolean;
  onClose: () => void;
  onTryTemplateAi: () => void;
};

export default function AiOnboardingSheet({ visible, onClose, onTryTemplateAi }: Props) {
  const { theme } = useAppTheme();

  const handleClose = async () => {
    await markAiOnboardingSeen();
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <View style={[styles.sheet, { backgroundColor: theme.surface }]}>
          <Text style={[styles.title, { color: theme.text }]}>Totus Assist is ready</Text>
          <Text style={{ color: theme.textMuted, marginBottom: 16 }}>
            Your on-device AI model downloaded successfully. Here is what you can do now:
          </Text>
          {[
            'Template Studio → paste a clinic form → AI assist',
            'Notes → Note Assist → bulletize or summarize',
            'Settings → Totus AI → browse all capabilities',
          ].map((item) => (
            <Text key={item} style={{ color: theme.textSecondary, marginBottom: 8 }}>
              • {item}
            </Text>
          ))}
          <Pressable
            style={[styles.primary, { backgroundColor: theme.primary }]}
            onPress={async () => {
              await markAiOnboardingSeen();
              onTryTemplateAi();
            }}>
            <Text style={{ color: theme.primaryText, fontWeight: '600' }}>Try Template AI</Text>
          </Pressable>
          <Pressable style={styles.secondary} onPress={handleClose}>
            <Text style={{ color: theme.textMuted }}>Got it</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 24,
    paddingBottom: 36,
  },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 8 },
  primary: { borderRadius: 10, paddingVertical: 14, alignItems: 'center', marginTop: 16 },
  secondary: { paddingVertical: 12, alignItems: 'center' },
});
