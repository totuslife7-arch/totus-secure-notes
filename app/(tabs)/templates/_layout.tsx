import { Stack } from 'expo-router';

export default function TemplatesLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Templates' }} />
      <Stack.Screen name="postpartum" options={{ title: 'Postpartum Note' }} />
      <Stack.Screen name="builtin/[id]" options={{ title: 'Built-in Template' }} />
      <Stack.Screen name="studio/index" options={{ title: 'Template Studio' }} />
      <Stack.Screen name="studio/paste" options={{ title: 'Paste Form' }} />
      <Stack.Screen name="studio/review" options={{ title: 'Review Template' }} />
      <Stack.Screen name="studio/[id]" options={{ title: 'Fill Template' }} />
      <Stack.Screen name="marketplace" options={{ title: 'Template Library' }} />
    </Stack>
  );
}
