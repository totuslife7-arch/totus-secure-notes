import { router } from 'expo-router';
import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { ALL_TEMPLATES, TemplateDefinition } from '@/store/templates';

interface TemplateGalleryProps {
  onSelectMarkdown?: (template: TemplateDefinition) => void;
}

export default function TemplateGallery({ onSelectMarkdown }: TemplateGalleryProps) {
  const handlePress = (template: TemplateDefinition) => {
    if (template.type === 'form' && template.route) {
      router.push(template.route as '/templates/postpartum');
      return;
    }

    onSelectMarkdown?.(template);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Choose a Template</Text>
      <FlatList
        data={ALL_TEMPLATES}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable style={styles.row} onPress={() => handlePress(item)}>
            <View style={styles.rowHeader}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.badge}>{item.type === 'form' ? 'Form' : 'Markdown'}</Text>
            </View>
            <Text style={styles.description}>{item.description}</Text>
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
  heading: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 16,
    color: '#111827',
  },
  row: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  rowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  badge: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2563eb',
    backgroundColor: '#dbeafe',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    overflow: 'hidden',
  },
  description: {
    color: '#4b5563',
    fontSize: 14,
  },
});
