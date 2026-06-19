import { Stack } from 'expo-router';

export default function TemplatesLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Templates' }} />
      <Stack.Screen name="postpartum" options={{ title: 'Postpartum Note' }} />
    </Stack>
  );
}
