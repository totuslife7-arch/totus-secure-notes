import React, { useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import NumericField from '@/components/form/NumericField';
import KeyboardAwareScrollView from '@/components/KeyboardAwareScrollView';
import ThemedTextInput from '@/components/ThemedTextInput';
import { useAppTheme } from '@/context/ThemeContext';
import { useVault } from '@/context/VaultContext';
import { copyToClipboard } from '@/services/export';
import { CustomTemplateDefinition } from '@/store/customTemplateSchema';
import {
  emptyFormData,
  formatCustomTemplateNote,
} from '@/utils/customTemplateFormat';
import { formatCustomTemplateForEmr } from '@/utils/formatEmrExport';

interface GenericCustomFormProps {
  template: CustomTemplateDefinition;
  emrCopyLabel?: string;
  onEmrCopy?: (formData: Record<string, string>) => void | Promise<void>;
  /** Web vault viewer — hide save actions; copy only. */
  readOnly?: boolean;
  onClipboardCopy?: (text: string) => Promise<void>;
}

export default function GenericCustomForm({
  template,
  emrCopyLabel = 'Copy for Plexia',
  onEmrCopy,
  readOnly = false,
  onClipboardCopy,
}: GenericCustomFormProps) {
  const { theme } = useAppTheme();
  const { createNote, saveNote, sessionPassword } = useVault();
  const insets = useSafeAreaInsets();
  const [formData, setFormData] = useState(() => emptyFormData(template));
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewText, setPreviewText] = useState('');

  const updateField = (id: string, value: string) => {
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleCopy = async () => {
    const text = formatCustomTemplateNote(template, formData);
    if (onClipboardCopy) {
      await onClipboardCopy(text);
      return;
    }
    await copyToClipboard(text, sessionPassword, `template:${template.id}`);
    Alert.alert('Copied', 'Form copied to clipboard.');
  };

  const handleEmrCopy = async () => {
    const text = formatCustomTemplateForEmr(template, formData);
    setPreviewText(text);
    setPreviewVisible(true);
  };

  const confirmEmrCopy = async () => {
    if (onEmrCopy) {
      await onEmrCopy(formData);
    } else if (onClipboardCopy) {
      await onClipboardCopy(previewText);
    } else {
      await copyToClipboard(previewText, sessionPassword, `emr:${template.id}`);
      Alert.alert('Copied', 'EMR-safe text copied — ready to paste into Plexia or your charting system.');
    }
    setPreviewVisible(false);
  };

  const handleSaveNote = async () => {
    const content = formatCustomTemplateNote(template, formData);
    const note = await createNote(template.title, content, `custom:${template.id}`);
    await saveNote({
      ...note,
      customTemplateId: template.id,
      formData,
    });
    Alert.alert('Saved', 'Note saved to your vault.');
  };

  return (
    <>
      <KeyboardAwareScrollView
        style={[styles.container, { backgroundColor: theme.background }]}
        extraBottomInset={insets.bottom}
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}>
        <Text style={[styles.heading, { color: theme.text }]}>{template.title}</Text>
        {template.description ? (
          <Text style={[styles.desc, { color: theme.textMuted }]}>{template.description}</Text>
        ) : null}

        {template.sections.map((section) => (
          <View key={section.id} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>{section.title}</Text>
            {section.fields.map((field) => (
              <View key={field.id} style={styles.field}>
                {field.type === 'checkbox' ? (
                  <View style={styles.checkboxRow}>
                    <Switch
                      value={formData[field.id] === 'true'}
                      onValueChange={(v) => updateField(field.id, v ? 'true' : 'false')}
                    />
                    <Text style={{ color: theme.text, flex: 1 }}>{field.label}</Text>
                  </View>
                ) : field.type === 'number' ? (
                  <>
                    <Text style={[styles.label, { color: theme.textSecondary }]}>{field.label}</Text>
                    <NumericField
                      label=""
                      value={formData[field.id]}
                      onChangeText={(v) => updateField(field.id, v)}
                    />
                  </>
                ) : (
                  <>
                    <Text style={[styles.label, { color: theme.textSecondary }]}>{field.label}</Text>
                    <ThemedTextInput
                      style={[styles.input, field.type === 'multiline' && styles.multiline]}
                      value={formData[field.id]}
                      onChangeText={(v) => updateField(field.id, v)}
                      placeholder={field.placeholder}
                      multiline={field.type === 'multiline'}
                      scrollEnabled={false}
                      textAlignVertical={field.type === 'multiline' ? 'top' : 'center'}
                      keyboardType={field.type === 'date' ? 'default' : 'default'}
                    />
                  </>
                )}
              </View>
            ))}
          </View>
        ))}

        <View style={styles.actions}>
          <Pressable
            style={[styles.button, { backgroundColor: theme.primary }]}
            onPress={handleCopy}>
            <Text style={[styles.buttonText, { color: theme.primaryText }]}>Copy to clipboard</Text>
          </Pressable>
          <Pressable
            style={[styles.button, { backgroundColor: theme.surfaceSecondary, borderColor: theme.border, borderWidth: 1 }]}
            onPress={handleEmrCopy}>
            <Text style={[styles.buttonText, { color: theme.text }]}>{emrCopyLabel}</Text>
          </Pressable>
          {!readOnly ? (
            <Pressable
              style={[styles.button, { backgroundColor: theme.surfaceSecondary, borderColor: theme.border, borderWidth: 1 }]}
              onPress={handleSaveNote}>
              <Text style={[styles.buttonText, { color: theme.text }]}>Save as note</Text>
            </Pressable>
          ) : null}
        </View>
      </KeyboardAwareScrollView>

      <Modal visible={previewVisible} animationType="slide" onRequestClose={() => setPreviewVisible(false)}>
        <View style={[styles.previewContainer, { backgroundColor: theme.background, paddingTop: insets.top + 16 }]}>
          <Text style={[styles.previewTitle, { color: theme.text }]}>EMR export preview</Text>
          <ScrollView style={styles.previewScroll}>
            <Text style={[styles.previewText, { color: theme.text }]}>{previewText}</Text>
          </ScrollView>
          <Pressable style={[styles.button, { backgroundColor: theme.primary }]} onPress={confirmEmrCopy}>
            <Text style={[styles.buttonText, { color: theme.primaryText }]}>Copy for Plexia</Text>
          </Pressable>
          <Pressable style={[styles.button, { marginTop: 8 }]} onPress={() => setPreviewVisible(false)}>
            <Text style={[styles.buttonText, { color: theme.textMuted }]}>Cancel</Text>
          </Pressable>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  heading: { fontSize: 22, fontWeight: '700', marginBottom: 4 },
  desc: { fontSize: 14, marginBottom: 16 },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 17, fontWeight: '600', marginBottom: 10 },
  field: { marginBottom: 12 },
  label: { fontSize: 13, marginBottom: 4, fontWeight: '500' },
  input: { minHeight: 44 },
  multiline: { minHeight: 100 },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  actions: { gap: 10, marginTop: 8 },
  button: { borderRadius: 10, paddingVertical: 14, alignItems: 'center' },
  buttonText: { fontSize: 16, fontWeight: '600' },
  previewContainer: { flex: 1, padding: 16 },
  previewTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
  previewScroll: { flex: 1, marginBottom: 12 },
  previewText: { fontSize: 15, lineHeight: 22 },
});
