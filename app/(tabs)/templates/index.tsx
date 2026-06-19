import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import AuthGate from '@/components/AuthGate';
import TemplateGallery from '@/components/TemplateGallery';
import { useVault } from '@/context/VaultContext';
import { TemplateDefinition } from '@/store/templates';

export default function TemplatesScreen() {
  const { createNote } = useVault();

  const handleSelectMarkdown = async (template: TemplateDefinition) => {
    const note = await createNote(template.title, template.content ?? '', template.id);
    router.push(`/note/${note.id}`);
  };

  return (
    <AuthGate title="Unlock Templates">
      <View style={styles.container}>
        <TemplateGallery onSelectMarkdown={handleSelectMarkdown} />
      </View>
    </AuthGate>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
