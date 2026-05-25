import * as Location from 'expo-location';

import { isForegroundGpsV1 } from './gps-v1-policy';
import { LocationError } from './location-errors';

export type ForegroundPosition = {
  latitude: number;
  longitude: number;
  accuracyMeters: number | null;
  timestamp: number;
};

function mapPosition(location: Location.LocationObject): ForegroundPosition {
  return {
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
    accuracyMeters: location.coords.accuracy ?? null,
    timestamp: location.timestamp,
  };
}

/**
 * Reads the device position using foreground permission only (GPS v1 policy).
 */
export async function getForegroundPosition(): Promise<ForegroundPosition> {
  if (!isForegroundGpsV1()) {
    throw new LocationError(
      'Background location is not enabled in this app version.',
      'POLICY_VIOLATION',
    );
  }

  const servicesEnabled = await Location.hasServicesEnabledAsync();
  if (!servicesEnabled) {
    throw new LocationError(
      'Location services are turned off on this device.',
      'SERVICES_DISABLED',
    );
  }

  const existing = await Location.getForegroundPermissionsAsync();
  let granted = existing.status === Location.PermissionStatus.GRANTED;

  if (!granted) {
    const requested = await Location.requestForegroundPermissionsAsync();
    granted = requested.status === Location.PermissionStatus.GRANTED;
  }

  if (!granted) {
    throw new LocationError('Location permission was denied.', 'PERMISSION_DENIED');
  }

  try {
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    return mapPosition(location);
  } catch {
    throw new LocationError(
      'Could not determine your current position.',
      'POSITION_UNAVAILABLE',
    );
  }
}
