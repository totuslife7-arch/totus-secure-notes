import {
  GeocodedStop,
  getNominatimUserAgent,
  RoutePlanResult,
} from '@/services/trip/mapsSettings';
import { TripStop } from '@/store/tripPlanner';

import { RouteProvider } from './googleMapsProvider';

const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org/search';
const OSRM_BASE = 'https://router.project-osrm.org/route/v1/driving';

const GEOCODE_DELAY_MS = 1100;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function geocodeWithNominatim(
  address: string,
): Promise<{ lat: number; lng: number } | null> {
  const params = new URLSearchParams({
    q: address.trim(),
    format: 'json',
    limit: '1',
  });
  const url = `${NOMINATIM_BASE}?${params.toString()}`;

  let response: Response;
  try {
    response = await fetch(url, {
      headers: { 'User-Agent': getNominatimUserAgent() },
    });
  } catch {
    throw new Error('Could not reach OpenStreetMap geocoding. Check internet connection.');
  }

  if (response.status === 429) {
    throw new Error(
      'OpenStreetMap geocoding rate limit reached. Wait a moment and try again.',
    );
  }

  if (!response.ok) {
    throw new Error(`OpenStreetMap geocoding failed (HTTP ${response.status}).`);
  }

  const data = (await response.json()) as { lat: string; lon: string }[];
  if (!data[0]) {
    return null;
  }

  return { lat: Number(data[0].lat), lng: Number(data[0].lon) };
}

export async function planRouteWithOsrm(stops: GeocodedStop[]): Promise<RoutePlanResult> {
  if (stops.length < 2) {
    return { plannedKm: 0, segmentKm: [] };
  }

  const coords = stops.map((s) => `${s.lng},${s.lat}`).join(';');
  const url = `${OSRM_BASE}/${coords}?overview=full&geometries=geojson`;

  let response: Response;
  try {
    response = await fetch(url);
  } catch {
    throw new Error('Could not reach OSRM route service. Check internet connection.');
  }

  if (response.status === 429) {
    throw new Error('OSRM route service rate limit reached. Wait a moment and try again.');
  }

  if (!response.ok) {
    throw new Error(`OSRM route planning failed (HTTP ${response.status}).`);
  }

  const data = (await response.json()) as {
    code?: string;
    message?: string;
    routes?: {
      distance: number;
      legs: { distance: number }[];
      geometry: { coordinates: [number, number][] };
    }[];
  };

  if (data.code !== 'Ok' || !data.routes?.[0]) {
    const detail = data.message ? ` ${data.message}` : '';
    throw new Error(`Could not plan driving route.${detail}`);
  }

  const route = data.routes[0];
  const segmentKm = route.legs.map((leg) => leg.distance / 1000);

  return {
    plannedKm: route.distance / 1000,
    segmentKm,
    polyline: route.geometry.coordinates.map(([lng, lat]) => ({ lat, lng })),
  };
}

export function createOsrmProvider(): RouteProvider {
  return {
    async geocodeStops(stops: TripStop[]) {
      const results: GeocodedStop[] = [];
      for (let i = 0; i < stops.length; i += 1) {
        if (i > 0) {
          await sleep(GEOCODE_DELAY_MS);
        }
        const stop = stops[i];
        const coords = await geocodeWithNominatim(stop.address);
        if (!coords) {
          throw new Error(`Could not geocode: ${stop.address}`);
        }
        results.push({ address: stop.address, lat: coords.lat, lng: coords.lng });
      }
      return results;
    },
    async planDrivingRoute(stops) {
      return planRouteWithOsrm(stops);
    },
  };
}
