export interface GpsTrackPoint {
  lat: number;
  lng: number;
  ts: string;
}

export interface TripStop {
  id: string;
  order: number;
  label?: string;
  address: string;
  lat?: number;
  lng?: number;
  linkedNoteId?: string;
}

export interface TripPlan {
  id: string;
  date: string;
  stops: TripStop[];
  plannedKm?: number;
  estimatedKm?: number;
  actualKm?: number;
  gpsTrack?: GpsTrackPoint[];
  status: 'draft' | 'active' | 'completed';
  createdAt: string;
  updatedAt: string;
}

export function createTripId(): string {
  return `trip_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export function createStopId(): string {
  return `stop_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export function createEmptyTrip(date = new Date().toISOString().slice(0, 10)): TripPlan {
  const now = new Date().toISOString();
  return {
    id: createTripId(),
    date,
    stops: [],
    status: 'draft',
    createdAt: now,
    updatedAt: now,
  };
}

export function createTripStop(order: number, address = '', label = ''): TripStop {
  return {
    id: createStopId(),
    order,
    address,
    label,
  };
}

export const MAX_TRIP_STOPS = 50;
