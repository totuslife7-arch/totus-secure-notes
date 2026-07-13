import { Stack, useFocusEffect, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  AppState,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import Markdown from 'react-native-markdown-display';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import AttachmentViewer from '@/components/AttachmentViewer';
import KeyboardAwareScrollView from '@/components/KeyboardAwareScrollView';
import ThemedTextInput from '@/components/ThemedTextInput';
import { useAppTheme } from '@/context/ThemeContext';
import { useVault } from '@/context/VaultContext';
import {
  pickAndEncryptAudio,
  pickAndEncryptPhoto,
  pickAndEncryptPhotoFromLibrary,
  secureDeleteAttachment,
} from '@/services/attachments';
import { ensureNotificationPermissions } from '@/services/notifications';
import { Note, EncryptedAttachment } from '@/services/storage';
import {
  NoteAssistAction,
  runNoteAssist,
  rulesNoteAssist,
} from '@/services/templateAi/noteAssist';
import { TemplateAiError } from '@/services/templateAi/generateTemplateDraft';

function buildDraft(note: Note): Note {
  return {
    ...note,
    isFlagged: note.isFlagged ?? false,
    reminderAt: note.reminderAt ?? null,
    extraNotes: note.extraNotes ?? '',
    attachments: note.attachments ?? [],
    notePasswordEnabled: note.notePasswordEnabled ?? false,
    followUpStatus: note.followUpStatus ?? 'open',
  };
}

function noteFingerprint(note: Note): string {
  return JSON.stringify({
    title: note.title,
    content: note.content,
    extraNotes: note.extraNotes,
    isFlagged: note.isFlagged,
    reminderAt: note.reminderAt,
    followUpStatus: note.followUpStatus,
    notePasswordEnabled: note.notePasswordEnabled,
    attachments: note.attachments?.map((a) => a.id),
  });
}

export default function NoteEditorScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getNote, saveNote, isUnlocked, isSaving, sessionPassword } = useVault();
  const { theme } = useAppTheme();
  const insets = useSafeAreaInsets();

  const noteFromVault = useMemo(() => (id ? getNote(id) : undefined), [getNote, id]);

  const [draft, setDraft] = useState<Note | null>(() =>
    id && noteFromVault ? buildDraft(noteFromVault) : null,
  );
  const [preview, setPreview] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [saveError, setSaveError] = useState('');
  const [extraOpen, setExtraOpen] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const draftRef = useRef<Note | null>(draft);
  const lastSavedRef = useRef<string>('');
  const persistChainRef = useRef<Promise<void>>(Promise.resolve());
  const scrollRef = useRef<ScrollView>(null);
  const [contentHeight, setContentHeight] = useState(280);
  const [viewingAttachment, setViewingAttachment] = useState<EncryptedAttachment | null>(null);
  const [assistRunning, setAssistRunning] = useState(false);
  const [assistStatus, setAssistStatus] = useState<string | null>(null);

  useEffect(() => {
    draftRef.current = draft;
  }, [draft]);

  const loadedIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!id) {
      setDraft(null);
      loadedIdRef.current = null;
      lastSavedRef.current = '';
      return;
    }

    if (loadedIdRef.current === id) {
      return;
    }

    const note = getNote(id);
    if (!note) {
      setDraft(null);
      return;
    }

    loadedIdRef.current = id;
    const next = buildDraft(note);
    setDraft(next);
    lastSavedRef.current = noteFingerprint(next);
  }, [id, getNote]);

  const persistDraft = useCallback(
    async (options?: { noteId?: string; snapshot?: Note | null }) => {
      const targetId = options?.noteId ?? draftRef.current?.id;
      const snapshot = options?.snapshot ?? null;

      const run = async () => {
        const current = draftRef.current;
        const toSave =
          current && current.id === targetId
            ? current
            : snapshot && snapshot.id === targetId
              ? snapshot
              : null;

        if (!toSave || !isUnlocked) {
          return;
        }

        const fingerprint = noteFingerprint(toSave);
        if (fingerprint === lastSavedRef.current) {
          return;
        }

        try {
          setSaveError('');
          await saveNote(toSave);
          if (toSave.id === draftRef.current?.id) {
            lastSavedRef.current = fingerprint;
            if (noteFingerprint(draftRef.current) === fingerprint) {
              setSavedAt(new Date().toLocaleTimeString());
            }
          }
        } catch {
          setSaveError('Could not save note. Vault may be locked.');
        }
      };

      persistChainRef.current = persistChainRef.current.then(run).catch(() => undefined);
      await persistChainRef.current;
    },
    [isUnlocked, saveNote],
  );

  useEffect(() => {
    if (!draft || !isUnlocked) {
      return;
    }

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      persistDraft();
    }, 2000);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [draft, isUnlocked, persistDraft]);

  useFocusEffect(
    useCallback(() => {
      return () => {
        if (timerRef.current) {
          clearTimeout(timerRef.current);
          timerRef.current = null;
        }
        const snapshot = draftRef.current;
        void persistDraft({ noteId: snapshot?.id, snapshot });
      };
    }, [persistDraft]),
  );

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'background' || state === 'inactive') {
        persistDraft();
      }
    });
    return () => subscription.remove();
  }, [persistDraft]);

  const handleSaveNow = useCallback(async () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    await persistDraft();
  }, [persistDraft]);

  const updateDraft = useCallback((patch: Partial<Note>) => {
    setDraft((current) => (current ? { ...current, ...patch } : current));
  }, []);

  const handleAddPhoto = async () => {
    if (!sessionPassword || !draft) {
      return;
    }
    Alert.alert('Add photo', 'Capture a new photo or import from gallery. Original is scrubbed when possible.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Camera',
        onPress: async () => {
          const result = await pickAndEncryptPhoto(sessionPassword, draft.id, sessionPassword);
          if (!result) {
            Alert.alert('Camera unavailable', 'Could not capture or encrypt photo.');
            return;
          }
          updateDraft({ attachments: [...(draft.attachments ?? []), result.attachment] });
          if (result.sourceScrubbed) {
            Alert.alert('Secured', 'Photo encrypted in vault. Original removed from gallery when possible.');
          }
        },
      },
      {
        text: 'Gallery',
        onPress: async () => {
          const result = await pickAndEncryptPhotoFromLibrary(sessionPassword, draft.id, sessionPassword);
          if (!result) {
            Alert.alert('Import failed', 'Could not import or encrypt photo.');
            return;
          }
          updateDraft({ attachments: [...(draft.attachments ?? []), result.attachment] });
          if (result.sourceScrubbed) {
            Alert.alert('Secured', 'Photo encrypted in vault. Original removed from gallery.');
          }
        },
      },
    ]);
  };

  const handleAddAudio = async () => {
    if (!sessionPassword || !draft) {
      return;
    }
    const result = await pickAndEncryptAudio(sessionPassword, draft.id, sessionPassword);
    if (!result) {
      Alert.alert('Media unavailable', 'Could not import or encrypt media.');
      return;
    }
    updateDraft({ attachments: [...(draft.attachments ?? []), result.attachment] });
    if (result.sourceScrubbed) {
      Alert.alert('Secured', 'Media encrypted in vault. Original removed from gallery when possible.');
    }
  };

  const handleRemoveAttachment = async (attachmentId: string) => {
    if (!draft || !sessionPassword) {
      return;
    }
    const target = draft.attachments?.find((item) => item.id === attachmentId);
    if (!target) return;

    Alert.alert('Secure delete?', 'Shreds encrypted file in vault. Cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete permanently',
        style: 'destructive',
        onPress: async () => {
          await secureDeleteAttachment(target, sessionPassword);
          updateDraft({
            attachments: (draft.attachments ?? []).filter((item) => item.id !== attachmentId),
          });
        },
      },
    ]);
  };

  const handleNoteAssist = (action: NoteAssistAction) => {
    if (!draft?.content.trim()) {
      Alert.alert('Empty note', 'Write something first.');
      return;
    }
    setAssistRunning(true);
    setAssistStatus(null);
    runNoteAssist(draft.content, action, setAssistStatus)
      .then((text) => {
        updateDraft({ content: text });
        setAssistStatus(null);
      })
      .catch((err) => {
        if (err instanceof TemplateAiError && err.code === 'paywall') {
          Alert.alert('Pro required', err.message);
          return;
        }
        const fallback = rulesNoteAssist(draft.content, action);
        Alert.alert(
          'Using rules fallback',
          err instanceof Error ? err.message : 'AI unavailable.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Apply rules version', onPress: () => updateDraft({ content: fallback }) },
          ],
        );
      })
      .finally(() => setAssistRunning(false));
  };

  const handleSetReminder = async () => {
    if (!draft) return;
    const granted = await ensureNotificationPermissions();
    if (!granted) {
      Alert.alert(
        'Notifications',
        'Enable notifications in system settings to receive note reminders.',
      );
    }
  };

  if (!draft) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.background }]}>
        <Text style={{ color: theme.danger, fontSize: 16 }}>Note not found.</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Edit Note',
          headerRight: () => (
            <Pressable onPress={handleSaveNow} style={styles.headerSave}>
              <Text style={{ color: theme.primary, fontWeight: '600' }}>Save</Text>
            </Pressable>
          ),
        }}
      />

      <KeyboardAwareScrollView
        ref={scrollRef}
        style={[styles.container, { backgroundColor: theme.background }]}
        extraBottomInset={insets.bottom + 24}
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}>
        <View style={[styles.toolbar, { borderBottomColor: theme.border }]}>
          <View style={styles.previewToggle}>
            <Text style={[styles.previewLabel, { color: theme.textSecondary }]}>Preview</Text>
            <Switch value={preview} onValueChange={setPreview} />
          </View>
          <View style={styles.saveStatus}>
            {isSaving ? <ActivityIndicator size="small" color={theme.primary} /> : null}
            <Text style={[styles.saveText, { color: theme.textMuted }]}>
              {saveError || (savedAt ? `Saved ${savedAt}` : 'Auto-save enabled')}
            </Text>
          </View>
        </View>

        <View style={[styles.metaRow, { borderBottomColor: theme.border }]}>
          <Pressable
            onPress={() => updateDraft({ isFlagged: !draft.isFlagged })}
            style={[styles.chip, draft.isFlagged && { backgroundColor: theme.flag }]}>
            <Text style={[styles.chipText, draft.isFlagged && { color: '#fff' }]}>
              {draft.isFlagged ? 'Flagged' : 'Flag'}
            </Text>
          </Pressable>
          <Pressable
            onPress={() =>
              updateDraft({
                followUpStatus: draft.followUpStatus === 'open' ? 'done' : 'open',
              })
            }
            style={[
              styles.chip,
              { backgroundColor: draft.followUpStatus === 'done' ? theme.successSurface : theme.surface },
            ]}>
            <Text style={{ color: theme.textSecondary, fontSize: 13 }}>
              Follow-up: {draft.followUpStatus === 'done' ? 'Done' : 'Open'}
            </Text>
          </Pressable>
          <Pressable onPress={() => setExtraOpen((v) => !v)} style={styles.chip}>
            <Text style={{ color: theme.textSecondary, fontSize: 13 }}>Extra notes</Text>
          </Pressable>
        </View>

        <ThemedTextInput
          style={styles.titleInput}
          value={draft.title}
          onChangeText={(title) => updateDraft({ title })}
          placeholder="Note title"
        />

        <ThemedTextInput
          style={styles.reminderInput}
          value={draft.reminderAt ?? ''}
          onChangeText={(reminderAt) => updateDraft({ reminderAt: reminderAt || null })}
          onFocus={handleSetReminder}
          placeholder="Reminder ISO date (e.g. 2026-06-18T09:00:00)"
          autoCapitalize="none"
        />

        <View style={styles.assistRow}>
          {(['bulletize', 'shorten', 'expand', 'summarize'] as NoteAssistAction[]).map((action) => (
            <Pressable
              key={action}
              style={[styles.assistChip, { borderColor: theme.border, backgroundColor: theme.surface }]}
              onPress={() => handleNoteAssist(action)}
              disabled={assistRunning}>
              <Text style={{ color: theme.primary, fontSize: 12, fontWeight: '600' }}>{action}</Text>
            </Pressable>
          ))}
        </View>
        {assistStatus ? (
          <Text style={{ color: theme.textMuted, fontSize: 12, marginHorizontal: 16 }}>{assistStatus}</Text>
        ) : null}

        {extraOpen ? (
          <ThemedTextInput
            style={styles.extraNotesInput}
            value={draft.extraNotes ?? ''}
            onChangeText={(extraNotes) => updateDraft({ extraNotes })}
            placeholder="Additional notes..."
            multiline
            scrollEnabled={false}
          />
        ) : null}

        <View style={styles.attachmentRow}>
          <Pressable style={[styles.attachButton, { backgroundColor: theme.primary }]} onPress={handleAddPhoto}>
            <Text style={styles.attachButtonText}>Photo</Text>
          </Pressable>
          <Pressable style={[styles.attachButton, { backgroundColor: theme.surfaceSecondary }]} onPress={handleAddAudio}>
            <Text style={{ color: theme.text, fontWeight: '600' }}>Audio</Text>
          </Pressable>
        </View>

        {(draft.attachments ?? []).length > 0 ? (
          <View style={styles.attachmentList}>
            {(draft.attachments ?? []).map((attachment) => (
              <View key={attachment.id} style={[styles.attachmentItem, { borderColor: theme.border }]}>
                <Pressable
                  style={{ flex: 1 }}
                  onPress={() => setViewingAttachment(attachment)}>
                  <Text style={{ color: theme.primary }}>
                    {attachment.type}: {attachment.filename}
                  </Text>
                  <Text style={{ color: theme.textMuted, fontSize: 11 }}>Tap to view securely</Text>
                </Pressable>
                <Pressable onPress={() => handleRemoveAttachment(attachment.id)}>
                  <Text style={{ color: theme.danger }}>Shred</Text>
                </Pressable>
              </View>
            ))}
          </View>
        ) : null}

        {sessionPassword && viewingAttachment ? (
          <AttachmentViewer
            attachment={viewingAttachment}
            password={sessionPassword}
            auditPassword={sessionPassword}
            visible={!!viewingAttachment}
            onClose={() => setViewingAttachment(null)}
            onDeleted={() => {
              if (!draft) return;
              updateDraft({
                attachments: (draft.attachments ?? []).filter((a) => a.id !== viewingAttachment.id),
              });
              setViewingAttachment(null);
            }}
          />
        ) : null}

        {preview ? (
          <View style={styles.previewContainer}>
            <Markdown>{draft.content}</Markdown>
          </View>
        ) : (
          <ThemedTextInput
            style={[styles.contentInput, { height: Math.max(280, contentHeight) }]}
            value={draft.content}
            onChangeText={(content) => updateDraft({ content })}
            placeholder="Write markdown notes..."
            multiline
            scrollEnabled={false}
            textAlignVertical="top"
            onContentSizeChange={(event) => {
              setContentHeight(event.nativeEvent.contentSize.height);
            }}
            onFocus={() => {
              requestAnimationFrame(() => {
                scrollRef.current?.scrollToEnd({ animated: true });
              });
            }}
          />
        )}
      </KeyboardAwareScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerSave: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  previewToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  previewLabel: {
    fontSize: 14,
  },
  saveStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  saveText: {
    fontSize: 12,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  chip: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#e5e7eb',
  },
  chipText: {
    fontSize: 13,
    color: '#374151',
  },
  titleInput: {
    fontSize: 22,
    fontWeight: '700',
    marginHorizontal: 16,
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 0,
  },
  reminderInput: {
    marginHorizontal: 16,
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
  },
  extraNotesInput: {
    marginHorizontal: 16,
    marginTop: 8,
    minHeight: 72,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  attachmentRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  assistRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 16,
    marginTop: 8,
  },
  assistChip: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  attachButton: {
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  attachButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  attachmentList: {
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 6,
  },
  attachmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
  },
  contentInput: {
    minHeight: 280,
    margin: 16,
    padding: 12,
    fontSize: 16,
    lineHeight: 24,
    borderWidth: 0,
  },
  previewContainer: {
    padding: 16,
    minHeight: 200,
  },
});
