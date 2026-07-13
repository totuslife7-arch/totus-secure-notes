import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import KeyboardAwareScrollView from '@/components/KeyboardAwareScrollView';
import { useAppTheme } from '@/context/ThemeContext';
import {
  fetchMarketplaceDefinition,
  fetchMarketplaceManifest,
  MarketplaceTemplateEntry,
} from '@/services/templateMarketplace';

export default function TemplateMarketplaceScreen() {
  const { theme } = useAppTheme();
  const insets = useSafeAreaInsets();
  const [templates, setTemplates] = useState<MarketplaceTemplateEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [importingId, setImportingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const manifest = await fetchMarketplaceManifest();
      setTemplates(manifest.templates);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load().catch(() => undefined);
  }, [load]);

  const handleImport = async (entry: MarketplaceTemplateEntry) => {
    setImportingId(entry.id);
    try {
      const definition = await fetchMarketplaceDefinition(entry);
      router.push({
        pathname: '/templates/studio/review' as never,
        params: {
          draft: JSON.stringify(definition),
          source: 'rules',
          paste: '',
          title: definition.title,
          category: definition.category,
          builtinId: '',
        },
      });
    } catch (err) {
      Alert.alert(
        'Import failed',
        err instanceof Error ? err.message : 'Could not load template.',
      );
    } finally {
      setImportingId(null);
    }
  };

  return (
    <KeyboardAwareScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      extraBottomInset={insets.bottom}
      contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}>
      <Text style={[styles.title, { color: theme.text }]}>Template library</Text>
      <Text style={{ color: theme.textMuted, marginBottom: 16 }}>
        Curated public templates — imported locally only. Totus does not upload your vault content.
      </Text>

      {loading ? (
        <ActivityIndicator color={theme.primary} />
      ) : (
        templates.map((entry) => (
          <View
            key={entry.id}
            style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={{ color: theme.text, fontWeight: '700' }}>{entry.title}</Text>
            <Text style={{ color: theme.textMuted, fontSize: 12 }}>{entry.category}</Text>
            <Text style={{ color: theme.textSecondary, fontSize: 13, marginTop: 4 }}>
              {entry.description}
            </Text>
            <Pressable
              style={[styles.button, { backgroundColor: theme.primary, opacity: importingId === entry.id ? 0.7 : 1 }]}
              onPress={() => handleImport(entry)}
              disabled={importingId !== null}>
              {importingId === entry.id ? (
                <ActivityIndicator color={theme.primaryText} />
              ) : (
                <Text style={{ color: theme.primaryText, fontWeight: '600' }}>Customize in Studio</Text>
              )}
            </Pressable>
          </View>
        ))
      )}
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 4 },
  card: { borderRadius: 12, borderWidth: 1, padding: 14, marginBottom: 12, gap: 4 },
  button: { borderRadius: 10, paddingVertical: 12, alignItems: 'center', marginTop: 10 },
});
