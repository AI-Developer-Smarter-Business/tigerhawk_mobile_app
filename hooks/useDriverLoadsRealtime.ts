import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { AppState, type AppStateStatus } from 'react-native';

import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import {
  FOREGROUND_LOADS_REFETCH_MIN_MS,
  shouldRunThrottledRefetch,
} from '@/lib/query/foreground-refetch-throttle';
import { invalidateDriverLoads } from '@/lib/query/invalidate-loads';
import { refetchActiveDriverLoadQueries } from '@/lib/query/refetch-active-driver-loads';
import { subscribeDriverLoadsRealtime } from '@/lib/supabase/realtime/driver-loads-subscription';
import { getSupabase } from '@/lib/supabase/client';

/** Fallback poll when Realtime is slow or disconnected (TMS NotificationBell pattern). */
const ACTIVE_POLL_MS = 5_000;

/**
 * Keeps driver load list/detail/documents in sync when TMS updates Supabase.
 * Realtime + short polling while the app is active (no full reload needed).
 */
export function useDriverLoadsRealtime(): void {
  const queryClient = useQueryClient();
  const { isSupabaseAuthenticated, session } = useAuth();
  const { isDriver, assignedDriverId, loading: profileLoading } = useProfile();
  /** Cache key = `drivers.id` (same as list/detail queries — A.3). */
  const driverId = assignedDriverId ?? '';
  const subscriptionRef = useRef<{ unsubscribe: () => void } | null>(null);
  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!isSupabaseAuthenticated || profileLoading || !isDriver || !driverId) {
      return;
    }

    const supabase = getSupabase();
    subscriptionRef.current = subscribeDriverLoadsRealtime(
      supabase,
      queryClient,
      driverId,
    );

    return () => {
      subscriptionRef.current?.unsubscribe();
      subscriptionRef.current = null;
    };
  }, [
    isSupabaseAuthenticated,
    profileLoading,
    isDriver,
    driverId,
    queryClient,
    session?.access_token,
  ]);

  useEffect(() => {
    if (!driverId || !isDriver) return;

    const stopPoll = () => {
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
        pollTimerRef.current = null;
      }
    };

    const startPoll = () => {
      if (pollTimerRef.current) return;
      pollTimerRef.current = setInterval(() => {
        void refetchActiveDriverLoadQueries(queryClient, driverId);
      }, ACTIVE_POLL_MS);
    };

    const onAppState = (nextState: AppStateStatus) => {
      if (nextState === 'active') {
        startPoll();
        const throttleKey = `loads-foreground:${driverId}`;
        if (shouldRunThrottledRefetch(throttleKey, FOREGROUND_LOADS_REFETCH_MIN_MS)) {
          void invalidateDriverLoads(queryClient, driverId);
        }
        return;
      }
      stopPoll();
    };

    if (AppState.currentState === 'active') {
      startPoll();
    }

    const subscription = AppState.addEventListener('change', onAppState);
    return () => {
      subscription.remove();
      stopPoll();
    };
  }, [driverId, isDriver, queryClient]);
}
