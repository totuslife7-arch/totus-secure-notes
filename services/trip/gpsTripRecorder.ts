import * as Location from 'expo-location';

import { GpsTrackPoint } from '@/store/tripPlanner';
import { sumHaversinePath } from '@/services/trip/routeDistance';

type LocationCallback = (point: GpsTrackPoint, totalKm: number) => void;

let watchSubscription: Location.LocationSubscription | null = null;
let trackPoints: GpsTrackPoint[] = [];
let onUpdate: LocationCallback | null = null;

export function isGpsRecording(): boolean {
  return watchSubscription != null;
}

export function getCurrentTrack(): GpsTrackPoint[] {
  return [...trackPoints];
}

export function getTrackKm(): number {
  return sumHaversinePath(trackPoints);
}

export function updateGpsCallback(callback: LocationCallback | null): void {
  onUpdate = callback;
}

export async function requestLocationPermissions(): Promise<boolean> {
  try {
    const { status: foreground } = await Location.requestForegroundPermissionsAsync();
    if (foreground !== 'granted') {
      return false;
    }

    const { status: background } = await Location.requestBackgroundPermissionsAsync();
    return background === 'granted' || foreground === 'granted';
  } catch {
    return false;
  }
}

export async function startGpsRecording(callback: LocationCallback): Promise<boolean> {
  if (watchSubscription) {
    onUpdate = callback;
    return true;
  }

  const granted = await requestLocationPermissions();
  if (!granted) {
    return false;
  }

  trackPoints = [];
  onUpdate = callback;

  try {
    watchSubscription = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.Balanced,
        distanceInterval: 25,
        timeInterval: 5000,
      },
      (location) => {
        const point: GpsTrackPoint = {
          lat: location.coords.latitude,
          lng: location.coords.longitude,
          ts: new Date(location.timestamp).toISOString(),
        };
        trackPoints.push(point);
        onUpdate?.(point, getTrackKm());
      },
    );
  } catch {
    watchSubscription = null;
    onUpdate = null;
    trackPoints = [];
    return false;
  }

  return true;
}

export function stopGpsRecording(): { points: GpsTrackPoint[]; totalKm: number } {
  watchSubscription?.remove();
  watchSubscription = null;
  onUpdate = null;

  const result = { points: [...trackPoints], totalKm: getTrackKm() };
  trackPoints = [];
  return result;
}

/** Discard in-memory GPS buffer (e.g. when vault locks). Does not persist track data. */
export function discardGpsBuffer(): void {
  watchSubscription?.remove();
  watchSubscription = null;
  onUpdate = null;
  trackPoints = [];
}

export async function getCurrentCoordinates(): Promise<{ lat: number; lng: number } | null> {
  const granted = await requestLocationPermissions();
  if (!granted) {
    return null;
  }

  try {
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    return {
      lat: location.coords.latitude,
      lng: location.coords.longitude,
    };
  } catch {
    return null;
  }
}
