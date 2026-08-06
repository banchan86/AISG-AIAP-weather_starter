// Pure decision logic for the "Use my location" button. All branching
// (geofence, proximity dedup, geolocation error mapping) lives here so it
// can be unit-tested without touching the Geolocation API or the DOM.

// Mirrors the backend's inclusive validation bounds (routes/locations.ts).
export const SINGAPORE_BOUNDS = {
  latMin: 1.1,
  latMax: 1.5,
  lonMin: 103.6,
  lonMax: 104.1,
} as const;

// ~1 km expressed in degrees (1° latitude ≈ 111 km). Distance uses
// squared-Euclidean on raw degrees, matching the backend's
// nearest-neighbor convention — no geospatial library.
export const DEDUP_RADIUS_DEGREES = 1 / 111;

// GeolocationPositionError codes (the constants live on the error
// instance, which never reaches this pure module).
const PERMISSION_DENIED = 1;

export interface SavedCoordinate {
  id: number;
  latitude: number;
  longitude: number;
}

export type PositionInput =
  | { kind: 'position'; latitude: number; longitude: number }
  | { kind: 'error'; code: number };

export type LocationDecision =
  | { kind: 'create'; latitude: number; longitude: number }
  | { kind: 'select-existing'; id: number }
  | { kind: 'out-of-bounds' }
  | { kind: 'failure'; reason: 'permission-denied' | 'position-unavailable' };

export function decideLocationAction(
  input: PositionInput,
  saved: readonly SavedCoordinate[],
): LocationDecision {
  if (input.kind === 'error') {
    return {
      kind: 'failure',
      reason:
        input.code === PERMISSION_DENIED
          ? 'permission-denied'
          : 'position-unavailable',
    };
  }

  const { latitude, longitude } = input;
  const { latMin, latMax, lonMin, lonMax } = SINGAPORE_BOUNDS;
  const inBounds =
    latMin <= latitude &&
    latitude <= latMax &&
    lonMin <= longitude &&
    longitude <= lonMax;
  if (!inBounds) return { kind: 'out-of-bounds' };

  let nearest: SavedCoordinate | null = null;
  let nearestDistance = Infinity;
  for (const location of saved) {
    const dLat = location.latitude - latitude;
    const dLon = location.longitude - longitude;
    const distance = dLat * dLat + dLon * dLon;
    if (distance < nearestDistance) {
      nearest = location;
      nearestDistance = distance;
    }
  }
  if (nearest && nearestDistance <= DEDUP_RADIUS_DEGREES ** 2) {
    return { kind: 'select-existing', id: nearest.id };
  }

  return { kind: 'create', latitude, longitude };
}
