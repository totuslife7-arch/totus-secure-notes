import { Stack } from 'expo-router';

export default function SettingsLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Settings' }} />
      <Stack.Screen name="totus-ai" options={{ title: 'Totus Assist' }} />
    </Stack>
  );
}
