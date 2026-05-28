import { isValidCoordinatePair } from './geo';

/** Opens coordinates in the system browser / maps app. */
export function buildGoogleMapsUrl(latitude: number, longitude: number): string {
  if (!isValidCoordinatePair(latitude, longitude)) {
    return 'https://maps.google.com/';
  }
  return `https://maps.google.com/?q=${latitude},${longitude}`;
}
