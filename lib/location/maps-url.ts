import { isValidCoordinatePair } from './geo';

export type MapsUrlOpener = (url: string) => Promise<unknown>;

/** Builds a map pin URL. It intentionally does not request turn-by-turn directions. */
export function buildGoogleMapsUrl(latitude: number, longitude: number): string {
  if (!isValidCoordinatePair(latitude, longitude)) {
    return 'https://maps.google.com/';
  }
  return `https://maps.google.com/?q=${latitude},${longitude}`;
}

/** Opens a validated coordinate pin through the platform URL handler. */
export async function openCoordinatesInMaps(
  latitude: number,
  longitude: number,
  openUrl: MapsUrlOpener,
): Promise<void> {
  if (!isValidCoordinatePair(latitude, longitude)) {
    throw new Error('Cannot open maps with invalid coordinates.');
  }

  await openUrl(buildGoogleMapsUrl(latitude, longitude));
}
