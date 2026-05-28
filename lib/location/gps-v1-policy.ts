/**
 * GPS scope for PP2 v1 (deadline 9 Jun 2026).
 * Single source of truth for tasks 5.1–5.4 and permission copy in app.json / strings.
 */
import { canPersistLocationToTms } from './tms-location-integration';

export const GPS_V1_POLICY = {
  /** v1 uses foreground location only while the app is open. */
  mode: 'foreground' as const,
  /** No background tracking or geofencing in v1. */
  backgroundTrackingEnabled: false,
  /** TMS POST for GPS — false until dedicated route is deployed (task 5.3 audit). */
  persistToTms: canPersistLocationToTms(),
  /** Planned surfaces (task 5.2+). */
  surfaces: ['load_detail'] as const,
} as const;

export type GpsV1Mode = (typeof GPS_V1_POLICY)['mode'];

/** Expo permission level required for v1 (no background). */
export const GPS_V1_EXPO_PERMISSION = 'whenInUse' as const;

export function isForegroundGpsV1(): boolean {
  return GPS_V1_POLICY.mode === 'foreground' && !GPS_V1_POLICY.backgroundTrackingEnabled;
}
