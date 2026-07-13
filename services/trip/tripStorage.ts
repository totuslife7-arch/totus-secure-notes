import * as FileSystem from 'expo-file-system/legacy';

import { encryptVaultJson, decryptVaultJson } from '@/services/sessionCrypto';
import { EncryptedPayload } from '@/services/encryption';
import { TripPlan } from '@/store/tripPlanner';

const TRIPS_DIR = `${FileSystem.documentDirectory}vault/`;
const TRIPS_FILE = `${TRIPS_DIR}trips.enc`;

export interface TripsVault {
  v: number;
  trips: TripPlan[];
}

async function ensureDir(): Promise<void> {
  const info = await FileSystem.getInfoAsync(TRIPS_DIR);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(TRIPS_DIR, { intermediates: true });
  }
}

export async function loadTrips(password: string): Promise<TripPlan[]> {
  await ensureDir();
  const info = await FileSystem.getInfoAsync(TRIPS_FILE);
  if (!info.exists) {
    return [];
  }

  try {
    const json = await FileSystem.readAsStringAsync(TRIPS_FILE);
    const payload = JSON.parse(json) as EncryptedPayload;
    const plaintext = await decryptVaultJson(payload, password);
    const data = JSON.parse(plaintext) as TripsVault;
    return data.trips ?? [];
  } catch {
    return [];
  }
}

export async function saveTrips(password: string, trips: TripPlan[]): Promise<void> {
  await ensureDir();
  const payload = await encryptVaultJson(
    JSON.stringify({ v: 1, trips } satisfies TripsVault),
    password,
  );
  await FileSystem.writeAsStringAsync(TRIPS_FILE, JSON.stringify(payload));
}

export async function getTripForDate(password: string, date: string): Promise<TripPlan | null> {
  const trips = await loadTrips(password);
  return trips.find((t) => t.date === date) ?? null;
}

export async function upsertTrip(password: string, trip: TripPlan): Promise<TripPlan[]> {
  const trips = await loadTrips(password);
  const index = trips.findIndex((t) => t.date === trip.date || t.id === trip.id);
  const existing = index >= 0 ? trips[index] : null;
  const updated = {
    ...existing,
    ...trip,
    id: existing?.id ?? trip.id,
    createdAt: existing?.createdAt ?? trip.createdAt,
    updatedAt: new Date().toISOString(),
  };

  if (index >= 0) {
    trips[index] = updated;
  } else {
    trips.unshift(updated);
  }

  const updatedIndex = index >= 0 ? index : 0;
  const deduped = trips.filter((candidate, candidateIndex) => {
    if (candidateIndex === updatedIndex) {
      return true;
    }
    return candidate.date !== updated.date && candidate.id !== updated.id;
  });

  await saveTrips(password, deduped);
  return deduped;
}

export async function addStopToTodayTrip(
  password: string,
  address: string,
  label?: string,
): Promise<TripPlan> {
  const today = new Date().toISOString().slice(0, 10);
  const trips = await loadTrips(password);
  let trip = trips.find((t) => t.date === today);

  if (!trip) {
    const { createEmptyTrip, createTripStop } = await import('@/store/tripPlanner');
    trip = createEmptyTrip(today);
    trip.stops = [createTripStop(0, address, label)];
    await upsertTrip(password, trip);
    return trip;
  }

  const existing = trip.stops.find(
    (s) => s.address.trim().toLowerCase() === address.trim().toLowerCase(),
  );
  if (existing) {
    if (label && !existing.label) {
      existing.label = label;
    }
    await upsertTrip(password, trip);
    return trip;
  }

  const { createTripStop, MAX_TRIP_STOPS } = await import('@/store/tripPlanner');
  if (trip.stops.length >= MAX_TRIP_STOPS) {
    return trip;
  }

  trip.stops.push(createTripStop(trip.stops.length, address, label));
  await upsertTrip(password, trip);
  return trip;
}

export function buildMileageSummary(trip: TripPlan | null): string {
  if (!trip) {
    return '';
  }
  const parts: string[] = [];
  if (trip.actualKm != null) {
    parts.push(`${trip.actualKm.toFixed(2)} km actual`);
  }
  if (trip.plannedKm != null) {
    parts.push(`${trip.plannedKm.toFixed(2)} km planned`);
  } else if (trip.estimatedKm != null) {
    parts.push(`${trip.estimatedKm.toFixed(2)} km estimated`);
  }
  if (parts.length === 0) {
    return '';
  }
  return `Mileage today: ${parts.join(' / ')}`;
}
