import React from 'react';
import { StyleSheet, View } from 'react-native';

import AuthGate from '@/components/AuthGate';
import TripPlannerScreen from '@/components/TripPlannerScreen';

export default function TripsTabScreen() {
  return (
    <AuthGate title="Unlock Trips">
      <View style={styles.container}>
        <TripPlannerScreen />
      </View>
    </AuthGate>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
