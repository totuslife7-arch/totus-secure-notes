import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import Markdown from 'react-native-markdown-display';

import { useVault } from '@/context/VaultContext';

export default function NoteEditorScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getNote, saveNote, isUnlocked } = useVault();
  const note = useMemo(() => (id ? getNote(id) : undefined), [getNote, id]);
  const [title, setTitle] = useState(note?.title ?? '');
  const [content, setContent] = useState(note?.content ?? '');
  const [preview, setPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
    }
  }, [note]);

  useEffect(() => {
    if (!note || !isUnlocked) {
      return;
    }

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(async () => {
      setSaving(true);
      await saveNote({
        ...note,
        title,
        content,
      });
      setSaving(false);
      setSavedAt(new Date().toLocaleTimeString());
    }, 2000);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [title, content, note, saveNote, isUnlocked]);

  if (!note) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Note not found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.toolbar}>
        <View style={styles.previewToggle}>
          <Text style={styles.previewLabel}>Preview</Text>
          <Switch value={preview} onValueChange={setPreview} />
        </View>
        <View style={styles.saveStatus}>
          {saving ? <ActivityIndicator size="small" /> : null}
          <Text style={styles.saveText}>{savedAt ? `Saved ${savedAt}` : 'Auto-save enabled'}</Text>
        </View>
      </View>

      <TextInput
        style={styles.titleInput}
        value={title}
        onChangeText={setTitle}
        placeholder="Note title"
      />

      {preview ? (
        <ScrollView style={styles.previewContainer}>
          <Markdown>{content}</Markdown>
        </ScrollView>
      ) : (
        <TextInput
          style={styles.contentInput}
          value={content}
          onChangeText={setContent}
          placeholder="Write markdown notes..."
          multiline
          textAlignVertical="top"
        />
      )}

      <Pressable
        style={styles.saveButton}
        onPress={async () => {
          setSaving(true);
          await saveNote({ ...note, title, content });
          setSaving(false);
          setSavedAt(new Date().toLocaleTimeString());
        }}>
        <Text style={styles.saveButtonText}>Save Now</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    color: '#b91c1c',
    fontSize: 16,
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  previewToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  previewLabel: {
    fontSize: 14,
    color: '#374151',
  },
  saveStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  saveText: {
    fontSize: 12,
    color: '#6b7280',
  },
  titleInput: {
    fontSize: 22,
    fontWeight: '700',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  contentInput: {
    flex: 1,
    padding: 16,
    fontSize: 16,
    lineHeight: 24,
  },
  previewContainer: {
    flex: 1,
    padding: 16,
  },
  saveButton: {
    margin: 16,
    backgroundColor: '#2563eb',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});
