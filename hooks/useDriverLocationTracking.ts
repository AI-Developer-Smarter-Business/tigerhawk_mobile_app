import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, type AppStateStatus } from 'react-native';

import { useNetwork } from '@/hooks/useNetwork';
import { mapLocationError } from '@/lib/errors/map-location-error';
import { mapSupabaseError } from '@/lib/errors/map-supabase-error';
import type { UserFacingError } from '@/lib/errors/types';
import { safeLog } from '@/lib/logging/safe-log';
import {
  getForegroundPosition,
  type ForegroundPosition,
} from '@/lib/location/get-foreground-position';
import { getForegroundPermissionSnapshot } from '@/lib/location/location-permission';
import { LocationError } from '@/lib/location/location-errors';
import {
  buildLiveTrackingLoadUpdate,
  isAcceptableTrackingAccuracy,
  isLiveTrackingActiveStatus,
  isLiveTrackingEnabled,
  resolveLiveTrackingIntervalMs,
  shouldSendLocationPing,
  type LastLocationPing,
} from '@/lib/location/tracking-policy';
import { updateLoadLiveLocation } from '@/lib/supabase/queries/update-load-live-location';
import type { LoadDetail } from '@/types';

export type DriverLocationTrackingState = {
  /** Loop active while load detail is focused and trip is eligible. */
  isTracking: boolean;
  lastSentAtMs: number | null;
  lastPosition: ForegroundPosition | null;
  error: UserFacingError | null;
  needsLocationSettings: boolean;
};

function mapTrackingError(err: unknown): UserFacingError {
  if (err instanceof LocationError) {
    return mapLocationError(err);
  }
  return mapSupabaseError(err);
}

export function useDriverLocationTracking(
  load: LoadDetail | null,
): DriverLocationTrackingState {
  const loadId = load?.id ?? null;
  const status = load?.status ?? null;
  const { isOffline, isReady: networkReady } = useNetwork();

  const [isTracking, setIsTracking] = useState(false);
  const [lastSentAtMs, setLastSentAtMs] = useState<number | null>(null);
  const [lastPosition, setLastPosition] = useState<ForegroundPosition | null>(null);
  const [error, setError] = useState<UserFacingError | null>(null);
  const [needsLocationSettings, setNeedsLocationSettings] = useState(false);

  const lastPingRef = useRef<LastLocationPing | null>(null);
  const tickInFlightRef = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const focusedRef = useRef(false);
  const appActiveRef = useRef(true);

  const clearIntervalLoop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsTracking(false);
  }, []);

  const runTick = useCallback(
    async (force = false) => {
      if (!loadId || !isLiveTrackingEnabled() || !isLiveTrackingActiveStatus(status)) {
        return;
      }
      if (!focusedRef.current || !appActiveRef.current) {
        return;
      }
      if (!networkReady || isOffline) {
        return;
      }
      if (tickInFlightRef.current) {
        return;
      }

      tickInFlightRef.current = true;
      try {
        const permission = await getForegroundPermissionSnapshot();
        if (!permission.granted || !permission.servicesEnabled) {
          setNeedsLocationSettings(true);
          return;
        }
        setNeedsLocationSettings(false);

        const position = await getForegroundPosition();
        if (!isAcceptableTrackingAccuracy(position.accuracyMeters)) {
          return;
        }

        if (
          !shouldSendLocationPing({
            newPosition: position,
            lastPing: lastPingRef.current,
            force,
          })
        ) {
          return;
        }

        await updateLoadLiveLocation({
          loadId,
          update: buildLiveTrackingLoadUpdate(position),
        });

        const sentAtMs = Date.now();
        lastPingRef.current = {
          latitude: position.latitude,
          longitude: position.longitude,
          sentAtMs,
        };
        setLastSentAtMs(sentAtMs);
        setLastPosition(position);
        setError(null);
        safeLog.event('driver_location_tracking', 'ping_sent', { loadId });
      } catch (err) {
        safeLog.event('driver_location_tracking', 'tick_failed', { loadId });
        setError(mapTrackingError(err));
      } finally {
        tickInFlightRef.current = false;
      }
    },
    [isOffline, loadId, networkReady, status],
  );

  const startIntervalLoop = useCallback(() => {
    clearIntervalLoop();
    if (
      !loadId ||
      !isLiveTrackingEnabled() ||
      !isLiveTrackingActiveStatus(status) ||
      !focusedRef.current ||
      !appActiveRef.current
    ) {
      return;
    }

    setIsTracking(true);
    void runTick(true);

    const intervalMs = resolveLiveTrackingIntervalMs();
    intervalRef.current = setInterval(() => {
      void runTick();
    }, intervalMs);
  }, [clearIntervalLoop, loadId, runTick, status]);

  useFocusEffect(
    useCallback(() => {
      focusedRef.current = true;
      startIntervalLoop();
      return () => {
        focusedRef.current = false;
        clearIntervalLoop();
      };
    }, [clearIntervalLoop, startIntervalLoop]),
  );

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (next: AppStateStatus) => {
      const active = next === 'active';
      appActiveRef.current = active;
      if (active && focusedRef.current) {
        startIntervalLoop();
      } else {
        clearIntervalLoop();
      }
    });
    return () => subscription.remove();
  }, [clearIntervalLoop, startIntervalLoop]);

  useEffect(() => {
    if (focusedRef.current && appActiveRef.current) {
      if (isLiveTrackingActiveStatus(status)) {
        startIntervalLoop();
      } else {
        clearIntervalLoop();
      }
    }
  }, [clearIntervalLoop, startIntervalLoop, status]);

  useEffect(() => {
    if (!isOffline && networkReady && focusedRef.current && appActiveRef.current) {
      void runTick();
    }
  }, [isOffline, networkReady, runTick]);

  return {
    isTracking,
    lastSentAtMs,
    lastPosition,
    error,
    needsLocationSettings,
  };
}
