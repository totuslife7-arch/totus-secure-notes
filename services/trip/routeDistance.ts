const EARTH_RADIUS_KM = 6371;

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

export function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function sumHaversinePath(points: { lat: number; lng: number }[]): number {
  if (points.length < 2) {
    return 0;
  }

  let total = 0;
  for (let i = 1; i < points.length; i += 1) {
    total += haversineKm(
      points[i - 1].lat,
      points[i - 1].lng,
      points[i].lat,
      points[i].lng,
    );
  }
  return total;
}

export function sumStopStraightLineKm(stops: { lat?: number; lng?: number }[]): number {
  const withCoords = stops.filter(
    (s): s is { lat: number; lng: number } => s.lat != null && s.lng != null,
  );
  return sumHaversinePath(withCoords);
}

export function formatKm(km: number | undefined | null): string {
  if (km == null || Number.isNaN(km)) {
    return '—';
  }
  return km.toFixed(2);
}
