import { router } from 'expo-router';
import React from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useVault } from '@/context/VaultContext';
import { Note } from '@/services/storage';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString();
}

export default function NoteList() {
  const { notes, createNote, deleteNote, isUnlocked } = useVault();

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
    <View style={styles.container}>
      <Pressable style={styles.newButton} onPress={handleNewNote}>
        <Text style={styles.newButtonText}>+ New Note</Text>
      </Pressable>

      <FlatList
        data={notes}
        keyExtractor={(item) => item.id}
        contentContainerStyle={notes.length === 0 ? styles.emptyList : undefined}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No encrypted notes yet. Create one or use a template.</Text>
        }
        renderItem={({ item }) => (
          <Pressable
            style={styles.row}
            onPress={() => router.push(`/note/${item.id}`)}
            onLongPress={() => handleDelete(item)}>
            <Text style={styles.title}>{item.title || 'Untitled Note'}</Text>
            <Text style={styles.preview} numberOfLines={2}>
              {item.content || 'Empty note'}
            </Text>
            <Text style={styles.meta}>{formatDate(item.updatedAt)}</Text>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f7fb',
  },
  newButton: {
    backgroundColor: '#2563eb',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 16,
  },
  newButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  emptyList: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 15,
    paddingHorizontal: 24,
  },
  row: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 6,
    color: '#111827',
  },
  preview: {
    color: '#4b5563',
    fontSize: 14,
    marginBottom: 8,
  },
  meta: {
    color: '#9ca3af',
    fontSize: 12,
  },
});
