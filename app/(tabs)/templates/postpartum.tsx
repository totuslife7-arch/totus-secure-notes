import React from 'react';
import { StyleSheet, View } from 'react-native';

import AuthGate from '@/components/AuthGate';
import PostpartumForm from '@/components/templates/PostpartumForm';

export default function PostpartumScreen() {
  return (
    <AuthGate title="Unlock Postpartum Template">
      <View style={styles.container}>
        <PostpartumForm />
      </View>
    </AuthGate>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
