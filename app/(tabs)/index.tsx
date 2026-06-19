import React from 'react';
import { StyleSheet, View } from 'react-native';

import AuthGate from '@/components/AuthGate';
import NoteList from '@/components/NoteList';

export default function NotesScreen() {
  return (
    <AuthGate title="Unlock Notes">
      <View style={styles.container}>
        <NoteList />
      </View>
    </AuthGate>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
