import { router } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import AuthGate from '@/components/AuthGate';
import ProUpgradeBanner from '@/components/ProUpgradeBanner';
import TotusAiHubCard from '@/components/TotusAiHubCard';
import ScreenHeader from '@/components/ui/ScreenHeader';
import StatusBadge from '@/components/ui/StatusBadge';
import { useAppTheme } from '@/context/ThemeContext';
import { useVault } from '@/context/VaultContext';
import { buildTaskDigest } from '@/services/taskDigest';
import { buildEnhancedTaskDigest } from '@/services/templateAi/taskDigestAi';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function HomeContent() {
  const { theme } = useAppTheme();
  const insets = useSafeAreaInsets();
  const { notes, isUnlocked, createNote } = useVault();
  const [aiDigest, setAiDigest] = useState<string | null>(null);

  const digest = useMemo(() => buildTaskDigest(notes), [notes]);
  const recentNotes = useMemo(
    () => [...notes].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 5),
    [notes],
  );

  useEffect(() => {
    buildEnhancedTaskDigest(notes)
      .then((d) => setAiDigest(d.aiSummary ?? null))
      .catch(() => setAiDigest(null));
  }, [notes]);

  if (!isUnlocked) {
    return null;
  }

  const handleNewNote = async () => {
    const note = await createNote();
    router.push(`/note/${note.id}`);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}>
      <ScreenHeader
        title="Home"
        subtitle="Your encrypted vault — local-first, nothing in the cloud."
      />

      <ProUpgradeBanner context="home" />

      <View style={[styles.vaultCard, { backgroundColor: theme.successSurface, borderColor: theme.border }]}>
        <StatusBadge label="Vault unlocked" variant="success" />
        <Text style={{ color: theme.textSecondary, fontSize: 14 }}>{digest.summary}</Text>
        {aiDigest ? (
          <Text style={{ color: theme.textMuted, fontSize: 13, marginTop: 4 }}>Assist: {aiDigest}</Text>
        ) : null}
      </View>

      <Text style={[styles.sectionTitle, { color: theme.text }]}>Quick actions</Text>
      <View style={styles.actionGrid}>
        <Pressable
          style={[styles.action, styles.actionFeatured, { backgroundColor: theme.surface, borderColor: theme.primary }]}
          onPress={() => router.push('/templates/postpartum' as never)}>
          <Text style={{ color: theme.primary, fontWeight: '700' }}>SoFo Postpartum HV</Text>
        </Pressable>
        <Pressable
          style={[styles.action, { backgroundColor: theme.surface, borderColor: theme.border }]}
          onPress={handleNewNote}>
          <Text style={{ color: theme.primary, fontWeight: '700' }}>New note</Text>
        </Pressable>
        <Pressable
          style={[styles.action, { backgroundColor: theme.surface, borderColor: theme.border }]}
          onPress={() => router.push('/templates/studio/paste' as never)}>
          <Text style={{ color: theme.primary, fontWeight: '700' }}>Template Studio</Text>
        </Pressable>
        <Pressable
          style={[styles.action, { backgroundColor: theme.surface, borderColor: theme.border }]}
          onPress={() => router.push('/trips' as never)}>
          <Text style={{ color: theme.primary, fontWeight: '700' }}>Trips</Text>
        </Pressable>
        <Pressable
          style={[styles.action, { backgroundColor: theme.surface, borderColor: theme.border }]}
          onPress={() => router.push('/settings/totus-ai' as never)}>
          <Text style={{ color: theme.primary, fontWeight: '700' }}>Totus Assist</Text>
        </Pressable>
      </View>

      <TotusAiHubCard compact />

      <View style={styles.recentHeader}>
        <Text style={[styles.sectionTitle, { color: theme.text, marginBottom: 0 }]}>Recent notes</Text>
        <Pressable onPress={() => router.push('/notes' as never)}>
          <Text style={{ color: theme.primary, fontWeight: '600' }}>See all</Text>
        </Pressable>
      </View>

      {recentNotes.length === 0 ? (
        <Text style={{ color: theme.textMuted, paddingHorizontal: 16 }}>
          No notes yet. Create one or start from a template.
        </Text>
      ) : (
        recentNotes.map((note) => (
          <Pressable
            key={note.id}
            style={[styles.noteRow, { backgroundColor: theme.surface, borderColor: theme.border }]}
            onPress={() => router.push(`/note/${note.id}`)}>
            <Text style={{ color: theme.text, fontWeight: '600' }} numberOfLines={1}>
              {note.title || 'Untitled Note'}
            </Text>
            <Text style={{ color: theme.textMuted, fontSize: 12 }} numberOfLines={1}>
              {note.content || 'Empty note'}
            </Text>
            <Text style={{ color: theme.textMuted, fontSize: 11, marginTop: 2 }}>
              {formatDate(note.updatedAt)}
            </Text>
          </Pressable>
        ))
      )}
    </ScrollView>
  );
}

export default function HomeScreen() {
  return (
    <AuthGate title="Unlock Vault">
      <HomeContent />
    </AuthGate>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  vaultCard: { marginHorizontal: 16, borderRadius: 12, borderWidth: 1, padding: 14, marginBottom: 16, gap: 6 },
  sectionTitle: { fontSize: 16, fontWeight: '600', paddingHorizontal: 16, marginBottom: 8 },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  action: {
    width: '47%',
    borderRadius: 10,
    borderWidth: 1,
    paddingVertical: 14,
    alignItems: 'center',
  },
  actionFeatured: {
    width: '100%',
    borderWidth: 2,
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
    marginTop: 8,
  },
  noteRow: {
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
  },
});
