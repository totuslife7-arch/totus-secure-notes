import { createGoogleProvider } from '@/services/trip/providers/googleMapsProvider';
import { createMapboxProvider } from '@/services/trip/providers/mapboxProvider';
import { createOsrmProvider } from '@/services/trip/providers/osrmProvider';
import {
  GeocodedStop,
  getDrivingRouteEngine,
  getGoogleMapsApiKey,
  getMapboxApiKey,
  RoutePlanResult,
} from '@/services/trip/mapsSettings';
import { TripStop } from '@/store/tripPlanner';

import { RouteProvider } from './providers/googleMapsProvider';

export async function getActiveRouteProvider(): Promise<RouteProvider> {
  const engine = await getDrivingRouteEngine();

  if (engine === 'google') {
    const key = await getGoogleMapsApiKey();
    if (key) {
      return createGoogleProvider(key);
    }
  }

  if (engine === 'mapbox') {
    const key = await getMapboxApiKey();
    if (key) {
      return createMapboxProvider(key);
    }
  }

  return createOsrmProvider();
}

export async function planProRoute(stops: TripStop[]): Promise<{
  geocoded: GeocodedStop[];
  result: RoutePlanResult;
}> {
  const withAddress = stops.filter((s) => s.address.trim());
  if (withAddress.length < 2) {
    throw new Error('Add at least two stops with addresses.');
  }

  const provider = await getActiveRouteProvider();
  const geocoded = await provider.geocodeStops(withAddress);
  const result = await provider.planDrivingRoute(geocoded);
  return { geocoded, result };
}
