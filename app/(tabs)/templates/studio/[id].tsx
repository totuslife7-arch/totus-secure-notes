import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import AuthGate from '@/components/AuthGate';
import GenericCustomForm from '@/components/templates/GenericCustomForm';
import { useVault } from '@/context/VaultContext';
import { getCustomTemplate } from '@/services/templateStudio/templateStorage';
import { CustomTemplateDefinition } from '@/store/customTemplateSchema';

export default function CustomTemplateFillScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { sessionPassword } = useVault();
  const [template, setTemplate] = useState<CustomTemplateDefinition | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      if (!sessionPassword || !id) {
        setLoading(false);
        return;
      }
      const tpl = await getCustomTemplate(sessionPassword, id);
      setTemplate(tpl);
      setLoading(false);
    })();
  }, [sessionPassword, id]);

  return (
    <AuthGate title="Unlock Template">
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator />
        </View>
      ) : !template ? (
        <View style={styles.centered}>
          <Text>Template not found.</Text>
        </View>
      ) : (
        <GenericCustomForm template={template} />
      )}
    </AuthGate>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
