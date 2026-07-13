import { GeocodedStop, RoutePlanResult } from '@/services/trip/mapsSettings';
import { TripStop } from '@/store/tripPlanner';

export interface RouteProvider {
  geocodeStops(stops: TripStop[]): Promise<GeocodedStop[]>;
  planDrivingRoute(stops: GeocodedStop[]): Promise<RoutePlanResult>;
}

async function geocodeWithMapbox(
  address: string,
  token: string,
): Promise<{ lat: number; lng: number } | null> {
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${token}&limit=1`;
  const response = await fetch(url);
  const data = (await response.json()) as {
    features?: { center: [number, number] }[];
  };

  if (!data.features?.[0]) {
    return null;
  }

  const [lng, lat] = data.features[0].center;
  return { lat, lng };
}

export async function planRouteWithMapbox(
  stops: GeocodedStop[],
  token: string,
): Promise<RoutePlanResult> {
  if (stops.length < 2) {
    return { plannedKm: 0, segmentKm: [] };
  }

  const coords = stops.map((s) => `${s.lng},${s.lat}`).join(';');
  const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${coords}?access_token=${token}&geometries=geojson&overview=full`;

  const response = await fetch(url);
  const data = (await response.json()) as {
    routes?: {
      distance: number;
      legs: { distance: number }[];
      geometry: { coordinates: [number, number][] };
    }[];
  };

  if (!data.routes?.[0]) {
    throw new Error('Could not plan route with Mapbox.');
  }

  const route = data.routes[0];
  const segmentKm = route.legs.map((leg) => leg.distance / 1000);

  return {
    plannedKm: route.distance / 1000,
    segmentKm,
    polyline: route.geometry.coordinates.map(([lng, lat]) => ({ lat, lng })),
  };
}

export function createMapboxProvider(token: string): RouteProvider {
  return {
    async geocodeStops(stops) {
      const results: GeocodedStop[] = [];
      for (const stop of stops) {
        const coords = await geocodeWithMapbox(stop.address, token);
        if (!coords) {
          throw new Error(`Could not geocode: ${stop.address}`);
        }
        results.push({ address: stop.address, lat: coords.lat, lng: coords.lng });
      }
      return results;
    },
    async planDrivingRoute(stops) {
      return planRouteWithMapbox(stops, token);
    },
  };
}
