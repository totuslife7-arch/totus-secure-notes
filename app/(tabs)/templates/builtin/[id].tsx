import { router, useLocalSearchParams } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import GenericCustomForm from '@/components/templates/GenericCustomForm';
import { useAppTheme } from '@/context/ThemeContext';
import { useVault } from '@/context/VaultContext';
import { copyToClipboard } from '@/services/export';
import { upsertCustomTemplate } from '@/services/templateStudio/templateStorage';
import {
  cloneBuiltinForBriefcase,
  getBuiltinTemplate,
} from '@/store/builtinTemplates';
import { formatCustomTemplateForEmr } from '@/utils/formatEmrExport';
import { emptyFormData } from '@/utils/customTemplateFormat';

export default function BuiltinTemplateScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme } = useAppTheme();
  const { sessionPassword } = useVault();
  const insets = useSafeAreaInsets();
  const template = useMemo(() => (id ? getBuiltinTemplate(id) : undefined), [id]);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewText, setPreviewText] = useState('');

  if (!template) {
    return (
      <View style={styles.centered}>
        <Text>Built-in template not found.</Text>
      </View>
    );
  }

  const handleCopyEmr = async () => {
    const data = emptyFormData(template);
    const text = formatCustomTemplateForEmr(template, data);
    setPreviewText(text);
    setPreviewVisible(true);
  };

  const handleCopyFilled = async (formData: Record<string, string>) => {
    if (!sessionPassword) {
      Alert.alert('Vault locked', 'Unlock the vault before copying.');
      return;
    }
    const text = formatCustomTemplateForEmr(template, formData);
    await copyToClipboard(text, sessionPassword, `builtin:${template.id}`);
    Alert.alert('Copied', 'EMR-safe text copied — ready to paste into Plexia or your charting system.');
  };

  const handleSaveToBriefcase = async () => {
    if (!sessionPassword) {
      Alert.alert('Locked', 'Unlock your vault first.');
      return;
    }
    const copy = cloneBuiltinForBriefcase(template);
    await upsertCustomTemplate(sessionPassword, copy);
    Alert.alert('Saved', 'Template copied to your briefcase.', [
      {
        text: 'Open briefcase',
        onPress: () => router.push('/templates/studio/index' as never),
      },
      { text: 'OK' },
    ]);
  };

  const handleAdapt = () => {
    router.push({
      pathname: '/templates/studio/paste' as never,
      params: { builtinId: template.id, category: template.category ?? 'Other' },
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <View style={[styles.toolbar, { borderBottomColor: theme.border, paddingTop: insets.top > 0 ? 0 : 8 }]}>
        <Pressable style={[styles.toolButton, { backgroundColor: theme.surfaceSecondary }]} onPress={handleCopyEmr}>
          <Text style={{ color: theme.text, fontWeight: '600', fontSize: 13 }}>Copy for EMR</Text>
        </Pressable>
        <Pressable style={[styles.toolButton, { backgroundColor: theme.surfaceSecondary }]} onPress={handleSaveToBriefcase}>
          <Text style={{ color: theme.text, fontWeight: '600', fontSize: 13 }}>Save to briefcase</Text>
        </Pressable>
        <Pressable style={[styles.toolButton, { backgroundColor: theme.primary }]} onPress={handleAdapt}>
          <Text style={{ color: theme.primaryText, fontWeight: '600', fontSize: 13 }}>Adapt form</Text>
        </Pressable>
      </View>

      <BuiltinFormHost template={template} onCopyForPlexia={handleCopyFilled} />

      <Modal visible={previewVisible} animationType="slide" onRequestClose={() => setPreviewVisible(false)}>
        <View style={[styles.previewContainer, { backgroundColor: theme.background, paddingTop: insets.top + 16 }]}>
          <Text style={[styles.previewTitle, { color: theme.text }]}>EMR export preview</Text>
          <ScrollView style={styles.previewScroll}>
            <Text style={[styles.previewText, { color: theme.text }]}>{previewText}</Text>
          </ScrollView>
          <Pressable
            style={[styles.previewClose, { backgroundColor: theme.primary }]}
            onPress={async () => {
              if (!sessionPassword) {
                Alert.alert('Vault locked', 'Unlock the vault before copying.');
                return;
              }
              await copyToClipboard(previewText, sessionPassword, `builtin-emr:${template.id}`);
              setPreviewVisible(false);
              Alert.alert('Copied', 'Empty template structure copied for EMR.');
            }}>
            <Text style={{ color: theme.primaryText, fontWeight: '600' }}>Copy & close</Text>
          </Pressable>
        </View>
      </Modal>
    </View>
  );
}

function BuiltinFormHost({
  template,
  onCopyForPlexia,
}: {
  template: NonNullable<ReturnType<typeof getBuiltinTemplate>>;
  onCopyForPlexia: (data: Record<string, string>) => void;
}) {
  return <GenericCustomForm template={template} emrCopyLabel="Copy for Plexia" onEmrCopy={onCopyForPlexia} />;
}

const styles = StyleSheet.create({
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  toolbar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 12,
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  toolButton: { borderRadius: 8, paddingVertical: 8, paddingHorizontal: 10 },
  previewContainer: { flex: 1, padding: 16 },
  previewTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
  previewScroll: { flex: 1, marginBottom: 12 },
  previewText: { fontSize: 15, lineHeight: 22 },
  previewClose: { borderRadius: 10, paddingVertical: 14, alignItems: 'center' },
});
