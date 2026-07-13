import { router } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import AdBanner from '@/components/AdBanner';
import ProUpgradeBanner from '@/components/ProUpgradeBanner';
import TotusAssistChip from '@/components/TotusAssistChip';
import EmptyState from '@/components/ui/EmptyState';
import { useAppTheme } from '@/context/ThemeContext';
import { useVault } from '@/context/VaultContext';
import { Note } from '@/services/storage';
import { buildTaskDigest } from '@/services/taskDigest';
import { buildEnhancedTaskDigest } from '@/services/templateAi/taskDigestAi';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString();
}

type FilterMode = 'all' | 'flagged' | 'open';

export default function NoteList() {
  const { notes, createNote, deleteNote, isUnlocked } = useVault();
  const { theme } = useAppTheme();
  const [filter, setFilter] = useState<FilterMode>('all');
  const [aiDigest, setAiDigest] = useState<string | null>(null);

  const digest = useMemo(() => buildTaskDigest(notes), [notes]);

  useEffect(() => {
    buildEnhancedTaskDigest(notes)
      .then((d) => setAiDigest(d.aiSummary ?? null))
      .catch(() => setAiDigest(null));
  }, [notes]);

  const filteredNotes = useMemo(() => {
    if (filter === 'flagged') {
      return notes.filter((note) => note.isFlagged);
    }
    if (filter === 'open') {
      return notes.filter((note) => note.followUpStatus === 'open');
    }
    return notes;
  }, [notes, filter]);

  const handleNewNote = async () => {
    const note = await createNote();
    router.push(`/note/${note.id}`);
  };

  const handleDelete = (note: Note) => {
    Alert.alert('Delete note', `Delete "${note.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => deleteNote(note.id),
      },
    ]);
  };

  if (!isUnlocked) {
    return null;
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ProUpgradeBanner context="notes" />

      <View style={[styles.digestCard, { backgroundColor: theme.successSurface }]}>
        <Text style={[styles.digestText, { color: theme.success }]}>{digest.summary}</Text>
        {aiDigest ? (
          <Text style={[styles.digestAi, { color: theme.textSecondary }]}>Assist: {aiDigest}</Text>
        ) : null}
      </View>

      <View style={styles.assistRow}>
        <TotusAssistChip context="notes" />
      </View>

      <View style={styles.filterRow}>
        {(['all', 'flagged', 'open'] as FilterMode[]).map((mode) => (
          <Pressable
            key={mode}
            onPress={() => setFilter(mode)}
            style={[
              styles.filterChip,
              {
                backgroundColor: filter === mode ? theme.primary : theme.surface,
                borderColor: theme.border,
              },
            ]}>
            <Text style={{ color: filter === mode ? theme.primaryText : theme.textSecondary, fontSize: 13 }}>
              {mode === 'all' ? 'All' : mode === 'flagged' ? 'Flagged' : 'Open tasks'}
            </Text>
          </Pressable>
        ))}
      </View>

      <Pressable style={[styles.newButton, { backgroundColor: theme.primary }]} onPress={handleNewNote}>
        <Text style={[styles.newButtonText, { color: theme.primaryText }]}>+ New Note</Text>
      </Pressable>

      <FlatList
        data={filteredNotes}
        keyExtractor={(item) => item.id}
        contentContainerStyle={filteredNotes.length === 0 ? styles.emptyList : undefined}
        ListEmptyComponent={
          <EmptyState
            title="No notes yet"
            message="No encrypted notes yet. Create one or use a template."
            actionLabel="Explore Totus Assist →"
            onAction={() => router.push('/settings/totus-ai' as never)}
          />
        }
        renderItem={({ item }) => (
          <Pressable
            style={[styles.row, { backgroundColor: theme.surface, borderColor: theme.border }]}
            onPress={() => router.push(`/note/${item.id}`)}
            onLongPress={() => handleDelete(item)}>
            <View style={styles.rowHeader}>
              <Text style={[styles.title, { color: theme.text }]}>{item.title || 'Untitled Note'}</Text>
              {item.isFlagged ? <Text style={{ color: theme.flag }}>★</Text> : null}
            </View>
            <Text style={[styles.preview, { color: theme.textMuted }]} numberOfLines={2}>
              {item.content || 'Empty note'}
            </Text>
            <Text style={[styles.meta, { color: theme.textMuted }]}>
              {formatDate(item.updatedAt)}
              {item.followUpStatus === 'open' ? ' · Open follow-up' : ''}
              {item.reminderAt ? ` · Reminder ${new Date(item.reminderAt).toLocaleString()}` : ''}
            </Text>
          </Pressable>
        )}
      />

      <AdBanner style={{ marginTop: 8 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  digestCard: {
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  digestText: {
    fontSize: 14,
    fontWeight: '600',
  },
  digestAi: {
    fontSize: 13,
    marginTop: 6,
  },
  assistRow: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 8,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  filterChip: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
  },
  newButton: {
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 16,
  },
  newButtonText: {
    fontWeight: '600',
    fontSize: 16,
  },
  emptyList: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  row: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  rowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    flex: 1,
  },
  preview: {
    fontSize: 14,
    marginBottom: 8,
  },
  meta: {
    fontSize: 12,
  },
});
