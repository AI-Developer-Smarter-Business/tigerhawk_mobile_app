/**
 * Live driver GPS policy (Semana 8 — task 8.7).
 * Foreground pings to Supabase `loads.current_*` every 30–60 s while on active trip.
 * @see docs/GPS_LIVE_TRACKING_ARCHITECTURE.md
 */
import { DRIVER_FIELD_STATUSES, FINAL_LOAD_STATUSES } from '@/lib/loads/constants';
import type { LoadStatus } from '@/types';

import { distanceMeters, isValidCoordinatePair } from './geo';
import type { ForegroundPosition } from './get-foreground-position';
import { isForegroundGpsV1 } from './gps-v1-policy';

/** Phase 0: Supabase direct UPDATE (RLS 8.5); TMS map reads same columns (8.12). */
export type LiveTrackingPersistMode = 'supabase';

/** Where dispatch sees the marker in TMS (tasks 8.12–8.13). */
export type LiveTrackingTmsSurface = 'load_detail' | 'dispatcher_board';

export const LIVE_TRACKING_POLICY = {
  mode: 'foreground' as const,
  persistMode: 'supabase' as const satisfies LiveTrackingPersistMode,
  /** Tick while load detail is focused (8.8 hook). */
  intervalMs: {
    min: 30_000,
    max: 60_000,
    default: 45_000,
  },
  /** Skip ping if driver moved less than this since last successful send. */
  minDistanceMeters: 25,
  /** Reject fixes worse than this before persisting (optional guard in 8.8). */
  maxAccuracyMeters: 200,
  loadsTable: 'loads' as const,
  locationColumns: [
    'current_latitude',
    'current_longitude',
    'last_seen_at',
    'location_accuracy_m',
  ] as const,
  tmsSurfaces: ['load_detail', 'dispatcher_board'] as const satisfies readonly LiveTrackingTmsSurface[],
} as const;

/**
 * Active trip statuses (absorbs task 8.2).
 * Tracking runs after dispatch, through field work, until Completed/Cancelled.
 */
export const LIVE_TRACKING_ACTIVE_STATUSES: ReadonlySet<LoadStatus> = new Set([
  'Dispatched',
  ...DRIVER_FIELD_STATUSES,
]);

export type LastLocationPing = {
  latitude: number;
  longitude: number;
  sentAtMs: number;
};

export type LiveTrackingLoadUpdate = {
  current_latitude: number;
  current_longitude: number;
  last_seen_at: string;
  location_accuracy_m: number | null;
};

export type ShouldSendLocationPingInput = {
  newPosition: Pick<ForegroundPosition, 'latitude' | 'longitude'>;
  lastPing?: LastLocationPing | null;
  nowMs?: number;
  /** First fix after opening load detail — always send. */
  force?: boolean;
};

export function isLiveTrackingActiveStatus(status: LoadStatus | null | undefined): boolean {
  if (!status) return false;
  if (FINAL_LOAD_STATUSES.has(status)) return false;
  return LIVE_TRACKING_ACTIVE_STATUSES.has(status);
}

export function isLiveTrackingEnabled(): boolean {
  return isForegroundGpsV1() && LIVE_TRACKING_POLICY.persistMode === 'supabase';
}

export function resolveLiveTrackingIntervalMs(): number {
  return LIVE_TRACKING_POLICY.intervalMs.default;
}

/** Spread device ticks across the 30–60 s window (deterministic for tests). */
export function resolveLiveTrackingIntervalMsWithJitter(seedMs: number): number {
  const { min, max } = LIVE_TRACKING_POLICY.intervalMs;
  const span = max - min;
  if (span <= 0) return min;
  return min + (Math.abs(seedMs) % span);
}

export function shouldSendLocationPing(input: ShouldSendLocationPingInput): boolean {
  const { force, lastPing, newPosition } = input;
  if (force || !lastPing) return true;

  if (!isValidCoordinatePair(newPosition.latitude, newPosition.longitude)) {
    return false;
  }

  const nowMs = input.nowMs ?? Date.now();
  const elapsed = nowMs - lastPing.sentAtMs;
  if (elapsed >= LIVE_TRACKING_POLICY.intervalMs.max) {
    return true;
  }

  const movedMeters = distanceMeters(
    { latitude: lastPing.latitude, longitude: lastPing.longitude },
    newPosition,
  );
  if (!Number.isFinite(movedMeters)) {
    return true;
  }

  return movedMeters >= LIVE_TRACKING_POLICY.minDistanceMeters;
}

export function isAcceptableTrackingAccuracy(accuracyMeters: number | null | undefined): boolean {
  if (accuracyMeters == null || !Number.isFinite(accuracyMeters)) {
    return true;
  }
  return accuracyMeters <= LIVE_TRACKING_POLICY.maxAccuracyMeters;
}

export function buildLiveTrackingLoadUpdate(position: ForegroundPosition): LiveTrackingLoadUpdate {
  return {
    current_latitude: position.latitude,
    current_longitude: position.longitude,
    last_seen_at: new Date(position.timestamp).toISOString(),
    location_accuracy_m: position.accuracyMeters,
  };
}

export function canStartLiveTracking(params: {
  status: LoadStatus | null | undefined;
  isForeground: boolean;
  hasLocationPermission: boolean;
}): boolean {
  return (
    isLiveTrackingEnabled() &&
    params.isForeground &&
    params.hasLocationPermission &&
    isLiveTrackingActiveStatus(params.status)
  );
}
