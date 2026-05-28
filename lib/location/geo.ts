import { LocationError } from './location-errors';

export const LATITUDE_MIN = -90;
export const LATITUDE_MAX = 90;
export const LONGITUDE_MIN = -180;
export const LONGITUDE_MAX = 180;

const EARTH_RADIUS_METERS = 6_371_000;

export function isValidLatitude(latitude: number): boolean {
  return Number.isFinite(latitude) && latitude >= LATITUDE_MIN && latitude <= LATITUDE_MAX;
}

export function isValidLongitude(longitude: number): boolean {
  return (
    Number.isFinite(longitude) && longitude >= LONGITUDE_MIN && longitude <= LONGITUDE_MAX
  );
}

export function isValidCoordinatePair(latitude: number, longitude: number): boolean {
  return isValidLatitude(latitude) && isValidLongitude(longitude);
}

/** Rejects NaN or out-of-range GPS readings before share/maps. */
export function assertValidCoordinates(latitude: number, longitude: number): void {
  if (!isValidCoordinatePair(latitude, longitude)) {
    throw new LocationError(
      'GPS coordinates are invalid. Try again outdoors with location enabled.',
      'POSITION_UNAVAILABLE',
    );
  }
}

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/** Great-circle distance in meters (Haversine). */
export function distanceMeters(
  from: { latitude: number; longitude: number },
  to: { latitude: number; longitude: number },
): number {
  if (!isValidCoordinatePair(from.latitude, from.longitude)) return NaN;
  if (!isValidCoordinatePair(to.latitude, to.longitude)) return NaN;

  const dLat = toRadians(to.latitude - from.latitude);
  const dLon = toRadians(to.longitude - from.longitude);
  const lat1 = toRadians(from.latitude);
  const lat2 = toRadians(to.latitude);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_METERS * c;
}
