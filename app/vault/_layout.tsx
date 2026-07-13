import { Stack } from 'expo-router';

import { WebVaultProvider } from '@/context/WebVaultContext';

export default function VaultLayout() {
  return (
    <WebVaultProvider>
      <Stack>
        <Stack.Screen name="index" options={{ title: 'Vault Viewer' }} />
        <Stack.Screen name="notes" options={{ title: 'Notes' }} />
        <Stack.Screen name="templates" options={{ title: 'Templates' }} />
        <Stack.Screen name="template/[id]" options={{ title: 'Fill Template' }} />
      </Stack>
    </WebVaultProvider>
  );
}
