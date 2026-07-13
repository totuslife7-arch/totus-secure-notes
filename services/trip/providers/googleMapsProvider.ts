import { GeocodedStop, RoutePlanResult } from '@/services/trip/mapsSettings';
import { TripStop } from '@/store/tripPlanner';

export interface RouteProvider {
  geocodeStops(stops: TripStop[]): Promise<GeocodedStop[]>;
  planDrivingRoute(stops: GeocodedStop[]): Promise<RoutePlanResult>;
}

interface GoogleApiResponse {
  status: string;
  error_message?: string;
}

async function fetchGoogleJson<T extends GoogleApiResponse>(
  url: string,
  context: string,
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url);
  } catch {
    throw new Error(`Could not reach Google Maps ${context}. Check internet connection.`);
  }

  if (!response.ok) {
    throw new Error(`Google Maps ${context} failed (HTTP ${response.status}).`);
  }

  try {
    return (await response.json()) as T;
  } catch {
    throw new Error(`Google Maps ${context} returned an unreadable response.`);
  }
}

function googleStatusError(context: string, data: GoogleApiResponse): Error {
  const detail = data.error_message ? ` ${data.error_message}` : '';
  if (data.status === 'REQUEST_DENIED') {
    return new Error(
      `Google Maps ${context} was denied.${detail} Enable Geocoding API and Directions API, confirm billing is active, and check API key restrictions.`,
    );
  }
  if (data.status === 'OVER_QUERY_LIMIT') {
    return new Error(`Google Maps ${context} quota was exceeded.${detail}`);
  }
  if (data.status === 'INVALID_REQUEST') {
    return new Error(`Google Maps ${context} request was invalid.${detail}`);
  }
  return new Error(`Google Maps ${context} failed (${data.status}).${detail}`);
}

export async function geocodeWithGoogle(
  address: string,
  apiKey: string,
): Promise<{ lat: number; lng: number } | null> {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;
  const data = await fetchGoogleJson<{
    status: string;
    error_message?: string;
    results?: { geometry: { location: { lat: number; lng: number } } }[];
  }>(url, 'geocoding');

  if (data.status === 'ZERO_RESULTS') {
    return null;
  }
  if (data.status !== 'OK' || !data.results?.[0]) {
    throw googleStatusError('geocoding', data);
  }

  return data.results[0].geometry.location;
}

export async function planRouteWithGoogle(
  stops: GeocodedStop[],
  apiKey: string,
): Promise<RoutePlanResult> {
  if (stops.length < 2) {
    return { plannedKm: 0, segmentKm: [] };
  }

  const origin = stops[0];
  const destination = stops[stops.length - 1];
  const waypoints = stops.slice(1, -1);

  const waypointParam =
    waypoints.length > 0
      ? `&waypoints=${waypoints.map((s) => `${s.lat},${s.lng}`).join('|')}`
      : '';

  const url =
    `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.lat},${origin.lng}` +
    `&destination=${destination.lat},${destination.lng}${waypointParam}&key=${apiKey}`;

  const data = await fetchGoogleJson<{
    status: string;
    error_message?: string;
    routes?: {
      legs: { distance: { value: number } }[];
      overview_polyline?: { points: string };
    }[];
  }>(url, 'route planning');

  if (data.status !== 'OK' || !data.routes?.[0]) {
    throw googleStatusError('route planning', data);
  }

  const route = data.routes[0];
  const segmentKm = route.legs.map((leg) => leg.distance.value / 1000);
  const plannedKm = segmentKm.reduce((sum, km) => sum + km, 0);

  return {
    plannedKm,
    segmentKm,
    polyline: decodeGooglePolyline(route.overview_polyline?.points ?? ''),
  };
}

function decodeGooglePolyline(encoded: string): { lat: number; lng: number }[] {
  if (!encoded) {
    return [];
  }

  const points: { lat: number; lng: number }[] = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  while (index < encoded.length) {
    let shift = 0;
    let result = 0;
    let byte: number;

    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    const deltaLat = result & 1 ? ~(result >> 1) : result >> 1;
    lat += deltaLat;

    shift = 0;
    result = 0;

    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    const deltaLng = result & 1 ? ~(result >> 1) : result >> 1;
    lng += deltaLng;

    points.push({ lat: lat / 1e5, lng: lng / 1e5 });
  }

  return points;
}

export function createGoogleProvider(apiKey: string): RouteProvider {
  return {
    async geocodeStops(stops) {
      const results: GeocodedStop[] = [];
      for (const stop of stops) {
        const coords = await geocodeWithGoogle(stop.address, apiKey);
        if (!coords) {
          throw new Error(`Could not geocode: ${stop.address}`);
        }
        results.push({ address: stop.address, lat: coords.lat, lng: coords.lng });
      }
      return results;
    },
    async planDrivingRoute(stops) {
      return planRouteWithGoogle(stops, apiKey);
    },
  };
}
