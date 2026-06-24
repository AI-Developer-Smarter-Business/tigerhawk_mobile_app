import { DRIVER_FIELD_STATUSES, FINAL_LOAD_STATUSES } from '@/lib/loads/constants';
import type { LoadStatus } from '@/types';

import type { ForegroundPosition } from '../get-foreground-position';
import {
  LIVE_TRACKING_ACTIVE_STATUSES,
  LIVE_TRACKING_POLICY,
  buildLiveTrackingLoadUpdate,
  canStartLiveTracking,
  isAcceptableTrackingAccuracy,
  isLiveTrackingActiveStatus,
  isLiveTrackingEnabled,
  resolveLiveTrackingIntervalMs,
  resolveLiveTrackingIntervalMsWithJitter,
  shouldSendLocationPing,
} from '../tracking-policy';

const samplePosition: ForegroundPosition = {
  latitude: 29.7604,
  longitude: -95.3698,
  accuracyMeters: 12,
  timestamp: 1_718_000_000_000,
};

describe('tracking-policy', () => {
  it('defines foreground Supabase persistence with 30–60 s interval', () => {
    expect(LIVE_TRACKING_POLICY.mode).toBe('foreground');
    expect(LIVE_TRACKING_POLICY.persistMode).toBe('supabase');
    expect(LIVE_TRACKING_POLICY.intervalMs.min).toBe(30_000);
    expect(LIVE_TRACKING_POLICY.intervalMs.max).toBe(60_000);
    expect(LIVE_TRACKING_POLICY.tmsSurfaces).toEqual(['load_detail', 'dispatcher_board']);
  });

  it('active statuses include Dispatched and all driver field statuses', () => {
    expect(LIVE_TRACKING_ACTIVE_STATUSES.has('Dispatched')).toBe(true);
    for (const status of DRIVER_FIELD_STATUSES) {
      expect(LIVE_TRACKING_ACTIVE_STATUSES.has(status)).toBe(true);
    }
    expect(LIVE_TRACKING_ACTIVE_STATUSES.has('Assigned')).toBe(false);
    for (const terminal of FINAL_LOAD_STATUSES) {
      expect(LIVE_TRACKING_ACTIVE_STATUSES.has(terminal)).toBe(false);
    }
  });

  it('isLiveTrackingActiveStatus excludes Assigned and terminal loads', () => {
    expect(isLiveTrackingActiveStatus('In Transit')).toBe(true);
    expect(isLiveTrackingActiveStatus('Arrived At Delivery')).toBe(true);
    expect(isLiveTrackingActiveStatus('Assigned')).toBe(false);
    expect(isLiveTrackingActiveStatus('Completed')).toBe(false);
    expect(isLiveTrackingActiveStatus(null)).toBe(false);
  });

  it('isLiveTrackingEnabled requires foreground v1 GPS', () => {
    expect(isLiveTrackingEnabled()).toBe(true);
  });

  it('resolveLiveTrackingIntervalMs returns default tick', () => {
    expect(resolveLiveTrackingIntervalMs()).toBe(45_000);
  });

  it('resolveLiveTrackingIntervalMsWithJitter stays within min–max', () => {
    const ms = resolveLiveTrackingIntervalMsWithJitter(1_718_123_456);
    expect(ms).toBeGreaterThanOrEqual(LIVE_TRACKING_POLICY.intervalMs.min);
    expect(ms).toBeLessThan(LIVE_TRACKING_POLICY.intervalMs.max);
  });

  it('shouldSendLocationPing sends first fix and forced pings', () => {
    expect(
      shouldSendLocationPing({
        newPosition: samplePosition,
        force: true,
      }),
    ).toBe(true);
    expect(
      shouldSendLocationPing({
        newPosition: samplePosition,
      }),
    ).toBe(true);
  });

  it('shouldSendLocationPing skips when barely moved inside max interval', () => {
    const lastPing = {
      latitude: samplePosition.latitude,
      longitude: samplePosition.longitude,
      sentAtMs: 1_718_000_000_000,
    };
    expect(
      shouldSendLocationPing({
        newPosition: { latitude: 29.76041, longitude: -95.36981 },
        lastPing,
        nowMs: lastPing.sentAtMs + 10_000,
      }),
    ).toBe(false);
  });

  it('shouldSendLocationPing sends after max interval even without movement', () => {
    const lastPing = {
      latitude: samplePosition.latitude,
      longitude: samplePosition.longitude,
      sentAtMs: 1_718_000_000_000,
    };
    expect(
      shouldSendLocationPing({
        newPosition: samplePosition,
        lastPing,
        nowMs: lastPing.sentAtMs + LIVE_TRACKING_POLICY.intervalMs.max,
      }),
    ).toBe(true);
  });

  it('shouldSendLocationPing sends when moved beyond min distance', () => {
    const lastPing = {
      latitude: samplePosition.latitude,
      longitude: samplePosition.longitude,
      sentAtMs: 1_718_000_000_000,
    };
    expect(
      shouldSendLocationPing({
        newPosition: { latitude: 29.77, longitude: -95.37 },
        lastPing,
        nowMs: lastPing.sentAtMs + 5_000,
      }),
    ).toBe(true);
  });

  it('isAcceptableTrackingAccuracy allows null and rejects very poor fixes', () => {
    expect(isAcceptableTrackingAccuracy(null)).toBe(true);
    expect(isAcceptableTrackingAccuracy(50)).toBe(true);
    expect(isAcceptableTrackingAccuracy(250)).toBe(false);
  });

  it('buildLiveTrackingLoadUpdate maps ForegroundPosition to loads columns', () => {
    expect(buildLiveTrackingLoadUpdate(samplePosition)).toEqual({
      current_latitude: 29.7604,
      current_longitude: -95.3698,
      last_seen_at: new Date(samplePosition.timestamp).toISOString(),
      location_accuracy_m: 12,
    });
  });

  it('canStartLiveTracking requires foreground, permission, and active status', () => {
    expect(
      canStartLiveTracking({
        status: 'In Transit' as LoadStatus,
        isForeground: true,
        hasLocationPermission: true,
      }),
    ).toBe(true);
    expect(
      canStartLiveTracking({
        status: 'Assigned',
        isForeground: true,
        hasLocationPermission: true,
      }),
    ).toBe(false);
    expect(
      canStartLiveTracking({
        status: 'In Transit',
        isForeground: false,
        hasLocationPermission: true,
      }),
    ).toBe(false);
  });
});
