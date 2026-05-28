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
import { subscribeDriverLoadsRealtime } from '@/lib/supabase/realtime/driver-loads-subscription';
import { getSupabase } from '@/lib/supabase/client';

/**
 * Keeps driver load list/detail in sync when TMS or dispatch updates `loads` in Supabase.
 * Also refetches when the app returns to foreground.
 */
export function useDriverLoadsRealtime(): void {
  const queryClient = useQueryClient();
  const { user, isSupabaseAuthenticated } = useAuth();
  const { isDriver, loading: profileLoading } = useProfile();
  const userId = user?.id ?? '';
  const subscriptionRef = useRef<{ unsubscribe: () => void } | null>(null);

  useEffect(() => {
    if (!isSupabaseAuthenticated || profileLoading || !isDriver || !userId) {
      return;
    }

    const supabase = getSupabase();
    subscriptionRef.current = subscribeDriverLoadsRealtime(
      supabase,
      queryClient,
      userId,
    );

    return () => {
      subscriptionRef.current?.unsubscribe();
      subscriptionRef.current = null;
    };
  }, [isSupabaseAuthenticated, profileLoading, isDriver, userId, queryClient]);

  useEffect(() => {
    if (!userId || !isDriver) return;

    const onAppState = (nextState: AppStateStatus) => {
      if (nextState !== 'active') {
        return;
      }
      const throttleKey = `loads-foreground:${userId}`;
      if (!shouldRunThrottledRefetch(throttleKey, FOREGROUND_LOADS_REFETCH_MIN_MS)) {
        return;
      }
      void invalidateDriverLoads(queryClient, userId);
    };

    const subscription = AppState.addEventListener('change', onAppState);
    return () => subscription.remove();
  }, [userId, isDriver, queryClient]);
}
