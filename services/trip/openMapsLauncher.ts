import { Linking, Platform } from 'react-native';

import {
  getExternalMapsApp,
  ExternalMapsApp,
} from '@/services/trip/mapsSettings';
import { TripStop } from '@/store/tripPlanner';

function encodeAddress(address: string): string {
  return encodeURIComponent(address.trim());
}

/** Universal https URL — works on Android and as iOS fallback. */
function buildGoogleMapsUrl(stops: TripStop[]): string {
  const withAddress = stops.filter((s) => s.address.trim());
  const origin = withAddress[0];
  const destination = withAddress[withAddress.length - 1];
  const waypoints = withAddress.slice(1, -1);

  if (withAddress.length === 1) {
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeAddress(origin.address)}`;
  }

  const waypointParam =
    waypoints.length > 0
      ? `&waypoints=${waypoints.map((w) => encodeAddress(w.address)).join('|')}`
      : '';

  return (
    `https://www.google.com/maps/dir/?api=1&origin=${encodeAddress(origin.address)}` +
    `&destination=${encodeAddress(destination.address)}${waypointParam}`
  );
}

/**
 * Google Maps iOS URL scheme — opens the installed Google Maps app with multi-stop routes.
 * Waypoints are chained in daddr using "+to:" (see Google Maps URL scheme docs).
 */
function buildGoogleMapsNativeUrl(stops: TripStop[]): string {
  const withAddress = stops.filter((s) => s.address.trim());

  if (withAddress.length === 1) {
    return `comgooglemaps://?daddr=${encodeAddress(withAddress[0].address)}&directionsmode=driving`;
  }

  const origin = withAddress[0];
  const destination = withAddress[withAddress.length - 1];
  const middle = withAddress.slice(1, -1);
  const destChain = [
    ...middle.map((w) => encodeAddress(w.address)),
    encodeAddress(destination.address),
  ].join('+to:');

  return (
    `comgooglemaps://?saddr=${encodeAddress(origin.address)}` +
    `&daddr=${destChain}&directionsmode=driving`
  );
}

function buildAppleMapsUrl(stops: TripStop[]): string {
  const withAddress = stops.filter((s) => s.address.trim());
  const destination = withAddress[withAddress.length - 1];
  const daddr = encodeAddress(destination.address);

  if (withAddress.length === 1) {
    return `maps://?daddr=${daddr}`;
  }

  const origin = withAddress[0];
  const saddr = encodeAddress(origin.address);
  return `maps://?saddr=${saddr}&daddr=${daddr}`;
}

async function tryOpenUrl(url: string): Promise<boolean> {
  try {
    // https URLs are reliable on both platforms even when canOpenURL is false on iOS.
    if (url.startsWith('https://')) {
      await Linking.openURL(url);
      return true;
    }
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
      return true;
    }
  } catch {
    return false;
  }
  return false;
}

async function openGoogleMapsRoute(stops: TripStop[]): Promise<boolean> {
  if (Platform.OS === 'ios') {
    const nativeUrl = buildGoogleMapsNativeUrl(stops);
    if (await tryOpenUrl(nativeUrl)) {
      return true;
    }
  }
  return tryOpenUrl(buildGoogleMapsUrl(stops));
}

export async function openRouteInMaps(
  stops: TripStop[],
  app?: ExternalMapsApp,
): Promise<boolean> {
  const withAddress = stops.filter((s) => s.address.trim());
  if (withAddress.length === 0) {
    return false;
  }

  const preferredApp = app ?? (await getExternalMapsApp());

  if (preferredApp === 'apple') {
    if (Platform.OS === 'ios') {
      return tryOpenUrl(buildAppleMapsUrl(withAddress));
    }
    return openGoogleMapsRoute(withAddress);
  }

  return openGoogleMapsRoute(withAddress);
}

export async function openRouteInPreferredMaps(stops: TripStop[]): Promise<boolean> {
  const app = await getExternalMapsApp();
  return openRouteInMaps(stops, app);
}

export async function openSingleStopInMaps(address: string): Promise<boolean> {
  return openRouteInPreferredMaps([{ id: 'single', order: 0, address }]);
}
