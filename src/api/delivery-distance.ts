/** CR-026 · REQ-ORD-075/076 — current delivery radius, not a driving route. */
export const DeliveryDistanceMode = { AUTO: 'AUTO', MANUAL: 'MANUAL' } as const;
export type DeliveryDistanceMode = (typeof DeliveryDistanceMode)[keyof typeof DeliveryDistanceMode];
export const DELIVERY_DISTANCE_MODES = [DeliveryDistanceMode.AUTO, DeliveryDistanceMode.MANUAL] as const;
export const DELIVERY_DISTANCE_MANUAL_MAX_KM = 99_999_999.99;

export interface DistanceCoordinates {
  lat?: string | number | null;
  lng?: string | number | null;
}

function coordinate(value: string | number | null | undefined, limit: number): number | null {
  if (value === null || value === undefined || (typeof value === 'string' && value.trim() === '')) return null;
  const number = Number(value);
  return Number.isFinite(number) && Math.abs(number) <= limit ? number : null;
}

export function isValidDeliveryDistanceKm(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 &&
    value <= DELIVERY_DISTANCE_MANUAL_MAX_KM && Number(value.toFixed(2)) === value;
}

/** Haversine on a sphere; preserve zero and return null for missing/invalid coordinates. */
function deliveryRadiusActualKm(origin: DistanceCoordinates | null | undefined, destination: DistanceCoordinates | null | undefined): number | null {
  const lat1 = coordinate(origin?.lat, 90);
  const lng1 = coordinate(origin?.lng, 180);
  const lat2 = coordinate(destination?.lat, 90);
  const lng2 = coordinate(destination?.lng, 180);
  if (lat1 === null || lng1 === null || lat2 === null || lng2 === null) return null;
  const rad = (degrees: number) => degrees * Math.PI / 180;
  const a = Math.sin(rad(lat2 - lat1) / 2) ** 2 +
    Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(rad(lng2 - lng1) / 2) ** 2;
  const km = 6371 * 2 * Math.asin(Math.sqrt(Math.min(1, Math.max(0, a))));
  return km;
}

export function resolveDeliveryDistanceActualKm(
  mode: DeliveryDistanceMode,
  manualKm: number | null | undefined,
  origin: DistanceCoordinates | null | undefined,
  destination: DistanceCoordinates | null | undefined,
): number | null {
  return mode === DeliveryDistanceMode.MANUAL
    ? (isValidDeliveryDistanceKm(manualKm) ? manualKm : null)
    : deliveryRadiusActualKm(origin, destination);
}

/** Legacy display precision; never ceil this already-rounded value for claims. */
export function deliveryRadiusKm(origin: DistanceCoordinates | null | undefined, destination: DistanceCoordinates | null | undefined): number | null {
  const actual = deliveryRadiusActualKm(origin, destination);
  return actual === null ? null : Math.round(actual * 100) / 100;
}

/** REQ-ORD-077: operational distances and rider payments use whole kilometres rounded up. */
export function resolveDeliveryDistanceKm(
  mode: DeliveryDistanceMode,
  manualKm: number | null | undefined,
  origin: DistanceCoordinates | null | undefined,
  destination: DistanceCoordinates | null | undefined,
): number | null {
  const actual = resolveDeliveryDistanceActualKm(mode, manualKm, origin, destination);
  return actual === null ? null : Math.ceil(actual);
}
