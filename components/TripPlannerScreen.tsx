import React, { useCallback, useEffect, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import PaywallSheet from '@/components/PaywallSheet';
import ProUpgradeBanner from '@/components/ProUpgradeBanner';
import TotusAssistChip from '@/components/TotusAssistChip';
import KeyboardAwareScrollView from '@/components/KeyboardAwareScrollView';
import ThemedTextInput from '@/components/ThemedTextInput';
import { useAppTheme } from '@/context/ThemeContext';
import { useMonetization } from '@/context/MonetizationContext';
import { useVault } from '@/context/VaultContext';
import { hasTripPlannerPro } from '@/services/monetization';
import {
  getCurrentCoordinates,
  getTrackKm,
  isGpsRecording,
  startGpsRecording,
  stopGpsRecording,
  updateGpsCallback,
} from '@/services/trip/gpsTripRecorder';
import {
  EXTERNAL_MAPS_LABELS,
  getExternalMapsApp,
  getInAppMapEnabled,
  OSM_TILE_URL,
} from '@/services/trip/mapsSettings';
import { openRouteInPreferredMaps } from '@/services/trip/openMapsLauncher';
import { planProRoute } from '@/services/trip/routePlanner';
import { formatKm, sumStopStraightLineKm } from '@/services/trip/routeDistance';
import { loadTrips, upsertTrip } from '@/services/trip/tripStorage';
import {
  createEmptyTrip,
  createTripStop,
  GpsTrackPoint,
  MAX_TRIP_STOPS,
  TripPlan,
  TripStop,
} from '@/store/tripPlanner';

function TripMapPreview({
  polyline,
}: {
  polyline: { lat: number; lng: number }[];
}) {
  const { theme } = useAppTheme();
  const [MapView, setMapView] = useState<React.ComponentType<any> | null>(null);
  const [Polyline, setPolyline] = useState<React.ComponentType<any> | null>(null);
  const [UrlTile, setUrlTile] = useState<React.ComponentType<any> | null>(null);

  useEffect(() => {
    import('react-native-maps')
      .then((mod) => {
        setMapView(() => mod.default);
        setPolyline(() => mod.Polyline);
        setUrlTile(() => mod.UrlTile);
      })
      .catch(() => {
        setMapView(null);
      });
  }, []);

  if (!MapView || !Polyline || polyline.length === 0) {
    return (
      <Text style={{ color: theme.textMuted, fontSize: 13 }}>
        Map preview requires a dev client build with react-native-maps (Pro).
      </Text>
    );
  }

  const latitudes = polyline.map((p) => p.lat);
  const longitudes = polyline.map((p) => p.lng);
  const minLat = Math.min(...latitudes);
  const maxLat = Math.max(...latitudes);
  const minLng = Math.min(...longitudes);
  const maxLng = Math.max(...longitudes);

  return (
    <View style={styles.mapWrap}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: (minLat + maxLat) / 2,
          longitude: (minLng + maxLng) / 2,
          latitudeDelta: Math.max(0.05, (maxLat - minLat) * 1.5),
          longitudeDelta: Math.max(0.05, (maxLng - minLng) * 1.5),
        }}>
        {UrlTile ? (
          <UrlTile urlTemplate={OSM_TILE_URL} maximumZ={19} flipY={false} />
        ) : null}
        <Polyline
          coordinates={polyline.map((p) => ({ latitude: p.lat, longitude: p.lng }))}
          strokeColor="#2563eb"
          strokeWidth={4}
        />
      </MapView>
      <Text style={[styles.mapAttribution, { color: theme.textMuted }]}>
        © OpenStreetMap contributors
      </Text>
    </View>
  );
}

export default function TripPlannerScreen() {
  const { sessionPassword, isUnlocked } = useVault();
  const { theme } = useAppTheme();
  const { state: monetization } = useMonetization();
  const insets = useSafeAreaInsets();
  const [trip, setTrip] = useState<TripPlan>(() => createEmptyTrip());
  const [loading, setLoading] = useState(true);
  const [recording, setRecording] = useState(false);
  const [liveKm, setLiveKm] = useState(0);
  const [paywallVisible, setPaywallVisible] = useState(false);
  const [planning, setPlanning] = useState(false);
  const [gpsBusy, setGpsBusy] = useState(false);
  const [gpsInterrupted, setGpsInterrupted] = useState(false);
  const [routePolyline, setRoutePolyline] = useState<{ lat: number; lng: number }[]>([]);
  const [externalMapsApp, setExternalMapsApp] = useState<'google' | 'apple'>('google');
  const [inAppMapEnabled, setInAppMapEnabled] = useState(true);

  const today = new Date().toISOString().slice(0, 10);

  const handleGpsUpdate = useCallback((_point: GpsTrackPoint, totalKm: number) => {
    setLiveKm(totalKm);
  }, []);

  const refreshTrip = useCallback(async () => {
    if (!sessionPassword) {
      setLoading(false);
      return;
    }
    try {
      const trips = await loadTrips(sessionPassword);
      let nextTrip = trips.find((t) => t.date === today) ?? createEmptyTrip(today);
      let interrupted = false;

      if (nextTrip.status === 'active' && !isGpsRecording()) {
        interrupted = true;
        nextTrip = { ...nextTrip, status: 'draft' };
        await upsertTrip(sessionPassword, nextTrip);
      }

      const activeRecording = isGpsRecording();
      if (activeRecording) {
        updateGpsCallback(handleGpsUpdate);
        setRecording(true);
        setLiveKm(getTrackKm());
      } else {
        updateGpsCallback(null);
        setRecording(false);
        setLiveKm(nextTrip.actualKm ?? 0);
      }

      setGpsInterrupted(interrupted);
      setTrip(nextTrip);
    } finally {
      setLoading(false);
    }
  }, [handleGpsUpdate, sessionPassword, today]);

  useFocusEffect(
    useCallback(() => {
      refreshTrip();
      return () => {
        updateGpsCallback(null);
      };
    }, [refreshTrip]),
  );

  useEffect(() => {
    refreshTrip();
  }, [refreshTrip]);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const [mapsApp, showInAppMap] = await Promise.all([
          getExternalMapsApp(),
          getInAppMapEnabled(),
        ]);
        setExternalMapsApp(mapsApp);
        setInAppMapEnabled(showInAppMap);
      })();
    }, []),
  );

  const isPro = hasTripPlannerPro(monetization);
  const stopsWithAddress = trip.stops.filter((s) => s.address.trim());
  const multiStopNeedsPro = stopsWithAddress.length >= 2 && !isPro;

  const persistTrip = async (next: TripPlan) => {
    if (!sessionPassword) {
      return;
    }
    setTrip(next);
    await upsertTrip(sessionPassword, next);
  };

  const updateStop = (id: string, patch: Partial<TripStop>) => {
    const stops = trip.stops.map((s) => (s.id === id ? { ...s, ...patch } : s));
    persistTrip({ ...trip, stops });
  };

  const addStop = () => {
    if (trip.stops.length >= MAX_TRIP_STOPS) {
      Alert.alert('Limit reached', `Maximum ${MAX_TRIP_STOPS} stops per trip.`);
      return;
    }
    persistTrip({
      ...trip,
      stops: [...trip.stops, createTripStop(trip.stops.length)],
    });
  };

  const removeStop = (id: string) => {
    const stops = trip.stops
      .filter((s) => s.id !== id)
      .map((s, index) => ({ ...s, order: index }));
    persistTrip({ ...trip, stops });
  };

  const moveStop = (id: string, direction: -1 | 1) => {
    const index = trip.stops.findIndex((s) => s.id === id);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= trip.stops.length) {
      return;
    }
    const stops = [...trip.stops];
    [stops[index], stops[target]] = [stops[target], stops[index]];
    persistTrip({
      ...trip,
      stops: stops.map((s, i) => ({ ...s, order: i })),
    });
  };

  const useCurrentLocation = async (stopId: string) => {
    const coords = await getCurrentCoordinates();
    if (!coords) {
      Alert.alert('Location unavailable', 'Could not get current location.');
      return;
    }
    updateStop(stopId, { lat: coords.lat, lng: coords.lng });
  };

  const handleOpenMaps = async () => {
    if (multiStopNeedsPro) {
      setPaywallVisible(true);
      return;
    }

    const opened = await openRouteInPreferredMaps(trip.stops);
    if (!opened) {
      Alert.alert(
        'Maps unavailable',
        `Add at least one address and ensure ${EXTERNAL_MAPS_LABELS[externalMapsApp]} is installed.`,
      );
    }
  };

  const handleEstimateStraightLine = () => {
    const km = sumStopStraightLineKm(trip.stops);
    persistTrip({ ...trip, estimatedKm: km });
  };

  const handleStartGps = async () => {
    if (gpsBusy) {
      return;
    }

    setGpsBusy(true);
    try {
      if (isGpsRecording()) {
        updateGpsCallback(handleGpsUpdate);
        setRecording(true);
        setLiveKm(getTrackKm());
        return;
      }

      const started = await startGpsRecording(handleGpsUpdate);
      if (!started) {
        Alert.alert('Permission needed', 'Allow location access to record trip mileage.');
        return;
      }

      setRecording(true);
      setLiveKm(getTrackKm());
      setGpsInterrupted(false);
      await persistTrip({ ...trip, status: 'active' });
    } catch {
      Alert.alert('GPS unavailable', 'Could not start GPS recording. Check location permissions and try again.');
    } finally {
      setGpsBusy(false);
    }
  };

  const handleStopGps = async () => {
    if (gpsBusy) {
      return;
    }

    if (!isGpsRecording()) {
      updateGpsCallback(null);
      setRecording(false);
      setLiveKm(trip.actualKm ?? 0);
      return;
    }

    setGpsBusy(true);
    const { points, totalKm } = stopGpsRecording();
    const completedTrip: TripPlan = {
      ...trip,
      status: 'completed',
      actualKm: totalKm,
      gpsTrack: points,
    };

    try {
      await persistTrip(completedTrip);
      setRecording(false);
      setLiveKm(totalKm);
      setGpsInterrupted(false);
    } catch {
      Alert.alert(
        'Could not save trip',
        'GPS recording stopped, but the completed mileage could not be saved. Keep the app unlocked and try again.',
      );
    } finally {
      setGpsBusy(false);
    }
  };

  const handlePlanProRoute = async () => {
    if (!isPro) {
      setPaywallVisible(true);
      return;
    }

    setPlanning(true);
    try {
      const { geocoded, result } = await planProRoute(trip.stops);
      const stops = trip.stops.map((stop) => {
        const match = geocoded.find(
          (g) => g.address.trim().toLowerCase() === stop.address.trim().toLowerCase(),
        );
        return match ? { ...stop, lat: match.lat, lng: match.lng } : stop;
      });
      setRoutePolyline(result.polyline ?? []);
      persistTrip({ ...trip, stops, plannedKm: result.plannedKm });
    } catch (error) {
      Alert.alert(
        'Route planning failed',
        error instanceof Error ? error.message : 'Check your internet connection and try again.',
      );
    } finally {
      setPlanning(false);
    }
  };

  if (!isUnlocked) {
    return null;
  }

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.background }]}>
        <ActivityIndicator color={theme.primary} />
      </View>
    );
  }

  const activelyRecording = recording || isGpsRecording();

  return (
    <>
    <KeyboardAwareScrollView
      style={{ backgroundColor: theme.background }}
      extraBottomInset={insets.bottom}
      contentContainerStyle={[styles.container, { paddingBottom: insets.bottom + 24 }]}>
      <ProUpgradeBanner context="trips" />
      <Text style={[styles.heading, { color: theme.text }]}>Mileage / Trip Planning</Text>
      <Text style={[styles.subheading, { color: theme.textMuted }]}>
        Plan up to {MAX_TRIP_STOPS} stops. GPS records the route your phone actually took.
      </Text>
      <View style={styles.assistRow}>
        <TotusAssistChip context="trips" />
      </View>

      <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <Text style={[styles.cardTitle, { color: theme.text }]}>Today&apos;s trip — {today}</Text>
        <Text style={{ color: theme.textMuted }}>
          Actual: {formatKm(activelyRecording ? liveKm : trip.actualKm)} km
          {' · '}
          Planned: {formatKm(trip.plannedKm)} km
          {' · '}
          Estimate: {formatKm(trip.estimatedKm)} km
        </Text>
        {gpsInterrupted ? (
          <Text style={{ color: theme.flag, fontSize: 13 }}>
            Previous GPS recording was interrupted when the vault locked. Start a new GPS trip when ready.
          </Text>
        ) : null}

        {!activelyRecording ? (
          <Pressable
            style={[styles.button, { backgroundColor: theme.primary, opacity: gpsBusy ? 0.7 : 1 }]}
            onPress={handleStartGps}
            disabled={gpsBusy}>
            <Text style={{ color: theme.primaryText, fontWeight: '600' }}>
              {gpsBusy ? 'Starting GPS...' : 'Start GPS Trip'}
            </Text>
          </Pressable>
        ) : (
          <Pressable
            style={[styles.button, { backgroundColor: theme.danger, opacity: gpsBusy ? 0.7 : 1 }]}
            onPress={handleStopGps}
            disabled={gpsBusy}>
            <Text style={{ color: '#fff', fontWeight: '600' }}>
              {gpsBusy ? 'Saving trip...' : `End GPS Trip (${formatKm(liveKm)} km)`}
            </Text>
          </Pressable>
        )}
      </View>

      {trip.stops.map((stop, index) => (
        <View key={stop.id} style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.stopTitle, { color: theme.text }]}>Stop {index + 1}</Text>
          <ThemedTextInput
            style={styles.input}
            placeholder="Patient name (optional)"
            value={stop.label ?? ''}
            onChangeText={(label) => updateStop(stop.id, { label })}
          />
          <ThemedTextInput
            style={styles.input}
            placeholder="Address"
            value={stop.address}
            onChangeText={(address) => updateStop(stop.id, { address })}
          />
          <View style={styles.row}>
            <Pressable style={styles.smallButton} onPress={() => moveStop(stop.id, -1)}>
              <Text style={{ color: theme.primary }}>Up</Text>
            </Pressable>
            <Pressable style={styles.smallButton} onPress={() => moveStop(stop.id, 1)}>
              <Text style={{ color: theme.primary }}>Down</Text>
            </Pressable>
            <Pressable style={styles.smallButton} onPress={() => useCurrentLocation(stop.id)}>
              <Text style={{ color: theme.primary }}>GPS pin</Text>
            </Pressable>
            <Pressable style={styles.smallButton} onPress={() => removeStop(stop.id)}>
              <Text style={{ color: theme.danger }}>Remove</Text>
            </Pressable>
          </View>
        </View>
      ))}

      <Pressable style={[styles.button, { backgroundColor: theme.surfaceSecondary }]} onPress={addStop}>
        <Text style={{ color: theme.text, fontWeight: '600' }}>+ Add stop</Text>
      </Pressable>

      <Pressable
        style={[
          styles.button,
          {
            backgroundColor: multiStopNeedsPro ? theme.surfaceSecondary : theme.primary,
          },
        ]}
        onPress={handleOpenMaps}>
        <Text
          style={{
            color: multiStopNeedsPro ? theme.textMuted : theme.primaryText,
            fontWeight: '600',
          }}>
          {multiStopNeedsPro
            ? `Open multi-stop in ${EXTERNAL_MAPS_LABELS[externalMapsApp]} — Pro required`
            : `Open in ${EXTERNAL_MAPS_LABELS[externalMapsApp]}`}
        </Text>
      </Pressable>

      <Pressable style={[styles.button, { backgroundColor: theme.surfaceSecondary }]} onPress={handleEstimateStraightLine}>
        <Text style={{ color: theme.text, fontWeight: '600' }}>Rough straight-line estimate</Text>
      </Pressable>

      <Pressable
        style={[styles.button, { backgroundColor: isPro ? theme.primary : theme.surfaceSecondary }]}
        onPress={handlePlanProRoute}
        disabled={planning}>
        {planning ? (
          <ActivityIndicator color={theme.primaryText} />
        ) : (
          <Text style={{ color: isPro ? theme.primaryText : theme.textMuted, fontWeight: '600' }}>
            {isPro ? 'Plan driving route (Pro)' : 'Plan driving route — Pro required'}
          </Text>
        )}
      </Pressable>

      {isPro && inAppMapEnabled && routePolyline.length > 0 ? (
        <TripMapPreview polyline={routePolyline} />
      ) : null}
    </KeyboardAwareScrollView>

    <PaywallSheet
      visible={paywallVisible}
      premiumUpsell
      onClose={() => setPaywallVisible(false)}
    />
    </>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 12 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  heading: { fontSize: 22, fontWeight: '700' },
  subheading: { fontSize: 14, lineHeight: 20, marginBottom: 8 },
  assistRow: { flexDirection: 'row', marginBottom: 12, gap: 8 },
  card: { borderRadius: 12, padding: 14, gap: 10, borderWidth: 1 },
  cardTitle: { fontSize: 16, fontWeight: '600' },
  stopTitle: { fontSize: 15, fontWeight: '600' },
  input: { paddingHorizontal: 12, paddingVertical: 10 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  smallButton: { paddingHorizontal: 10, paddingVertical: 6 },
  button: { borderRadius: 10, paddingVertical: 14, alignItems: 'center' },
  mapWrap: { marginTop: 8, gap: 4 },
  map: { height: 220, borderRadius: 12 },
  mapAttribution: { fontSize: 11, textAlign: 'right' },
});
