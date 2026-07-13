import * as SecureStore from 'expo-secure-store';

/** Which installed maps app opens when the user taps "Open route in Maps". */
export type ExternalMapsApp = 'google' | 'apple';

/** Optional advanced routing engine (Pro). OSRM is the default — no API key. */
export type DrivingRouteEngine = 'osrm' | 'google' | 'mapbox';

/** @deprecated Legacy provider id — migrated on read. */
export type LegacyMapsProvider = 'free' | 'google' | 'mapbox';

const EXTERNAL_MAPS_KEY = 'totus_external_maps_app';
const IN_APP_MAP_KEY = 'totus_in_app_map_enabled';
const ROUTE_ENGINE_KEY = 'totus_driving_route_engine';
const LEGACY_PROVIDER_KEY = 'totus_maps_provider';
const GOOGLE_KEY = 'totus_google_maps_api_key';
const MAPBOX_KEY = 'totus_mapbox_api_key';

const NOMINATIM_USER_AGENT = 'TotusSecureNotes/1.2.8 (trip planner; contact@totuslife.com)';

export const EXTERNAL_MAPS_LABELS: Record<ExternalMapsApp, string> = {
  google: 'Google Maps (app)',
  apple: 'Apple Maps',
};

export const ROUTE_ENGINE_LABELS: Record<DrivingRouteEngine, string> = {
  osrm: 'OpenStreetMap (OSRM)',
  google: 'Google Maps API',
  mapbox: 'Mapbox API',
};

let migrationDone = false;

async function migrateLegacyProvider(): Promise<void> {
  if (migrationDone) {
    return;
  }
  migrationDone = true;

  const legacy = await SecureStore.getItemAsync(LEGACY_PROVIDER_KEY);
  if (!legacy) {
    return;
  }

  if (legacy === 'google') {
    await SecureStore.setItemAsync(EXTERNAL_MAPS_KEY, 'google');
    const hasGoogleKey = await SecureStore.getItemAsync(GOOGLE_KEY);
    if (hasGoogleKey) {
      await SecureStore.setItemAsync(ROUTE_ENGINE_KEY, 'google');
    }
  } else if (legacy === 'mapbox') {
    await SecureStore.setItemAsync(IN_APP_MAP_KEY, 'true');
    const hasMapboxKey = await SecureStore.getItemAsync(MAPBOX_KEY);
    if (hasMapboxKey) {
      await SecureStore.setItemAsync(ROUTE_ENGINE_KEY, 'mapbox');
    }
  }

  await SecureStore.deleteItemAsync(LEGACY_PROVIDER_KEY);
}

export function defaultExternalMapsApp(): ExternalMapsApp {
  return 'google';
}

export async function getExternalMapsApp(): Promise<ExternalMapsApp> {
  await migrateLegacyProvider();
  const stored = await SecureStore.getItemAsync(EXTERNAL_MAPS_KEY);
  if (stored === 'google' || stored === 'apple') {
    return stored;
  }
  return defaultExternalMapsApp();
}

export async function setExternalMapsApp(app: ExternalMapsApp): Promise<void> {
  await SecureStore.setItemAsync(EXTERNAL_MAPS_KEY, app);
}

export async function getInAppMapEnabled(): Promise<boolean> {
  await migrateLegacyProvider();
  const stored = await SecureStore.getItemAsync(IN_APP_MAP_KEY);
  if (stored === 'true') {
    return true;
  }
  if (stored === 'false') {
    return false;
  }
  return true;
}

export async function setInAppMapEnabled(enabled: boolean): Promise<void> {
  await SecureStore.setItemAsync(IN_APP_MAP_KEY, enabled ? 'true' : 'false');
}

export async function getDrivingRouteEngine(): Promise<DrivingRouteEngine> {
  await migrateLegacyProvider();
  const stored = await SecureStore.getItemAsync(ROUTE_ENGINE_KEY);
  if (stored === 'google' || stored === 'mapbox' || stored === 'osrm') {
    return stored;
  }
  return 'osrm';
}

export async function setDrivingRouteEngine(engine: DrivingRouteEngine): Promise<void> {
  await SecureStore.setItemAsync(ROUTE_ENGINE_KEY, engine);
}

export async function getGoogleMapsApiKey(): Promise<string | null> {
  return SecureStore.getItemAsync(GOOGLE_KEY);
}

export async function setGoogleMapsApiKey(key: string): Promise<void> {
  await SecureStore.setItemAsync(GOOGLE_KEY, key.trim());
}

export async function getMapboxApiKey(): Promise<string | null> {
  return SecureStore.getItemAsync(MAPBOX_KEY);
}

export async function setMapboxApiKey(key: string): Promise<void> {
  await SecureStore.setItemAsync(MAPBOX_KEY, key.trim());
}

export function getNominatimUserAgent(): string {
  return NOMINATIM_USER_AGENT;
}

export interface GeocodedStop {
  address: string;
  lat: number;
  lng: number;
}

export interface RoutePlanResult {
  plannedKm: number;
  polyline?: { lat: number; lng: number }[];
  segmentKm: number[];
}

/** OpenStreetMap tile template for in-app map preview (no API key). */
export const OSM_TILE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
