import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { getUserFacingMessage } from '@/lib/errors';
import { emptyDriverLoadsBuckets } from '@/lib/loads/partition-driver-move-cards';
import type { DriverMoveCard } from '@/lib/loads/driver-move-card';
import {
  getDriverQueryGateError,
  isDriverLoadsQueryEnabled,
} from '@/lib/query/driver-query-gate';
import { queryKeys } from '@/lib/query/query-keys';
import { fetchMobileDriverLoads } from '@/lib/tms/fetch-driver-loads';

export type UseDriverLoadsBucketsResult = {
  active: DriverMoveCard[];
  upcoming: DriverMoveCard[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  retry: () => Promise<void>;
};

/**
 * Active / Upcoming from `GET /api/mobile/driver/loads` (TASKS B.1–B.3).
 * Does not list by `auth.uid` / legacy Supabase loads query.
 */
export function useDriverLoadsBuckets(): UseDriverLoadsBucketsResult {
  const queryClient = useQueryClient();
  const { isSupabaseAuthenticated, isInitialized, session } = useAuth();
  const { isDriver, assignedDriverId, loading: profileLoading } = useProfile();
  const driverId = assignedDriverId ?? '';

  const gateError = getDriverQueryGateError({
    isSupabaseAuthenticated,
    profileLoading,
    isDriver,
  });

  const enabled = isDriverLoadsQueryEnabled({
    isInitialized,
    isSupabaseAuthenticated,
    profileLoading,
    isDriver,
    driverId,
  });

  const query = useQuery({
    queryKey: queryKeys.loads.mobileBuckets(driverId),
    enabled,
    staleTime: 0,
    queryFn: async () => {
      const result = await fetchMobileDriverLoads({
        accessToken: session?.access_token,
      });
      if (!result.ok) {
        throw result.mobileError ?? new Error(result.error);
      }
      return result.buckets;
    },
  });

  const buckets = enabled
    ? (query.data ?? emptyDriverLoadsBuckets())
    : emptyDriverLoadsBuckets();

  const refetch = useCallback(async () => {
    if (!enabled) return;
    await queryClient.invalidateQueries({
      queryKey: queryKeys.loads.mobileBuckets(driverId),
    });
    await query.refetch();
  }, [enabled, queryClient, driverId, query]);

  const loading =
    !isInitialized ||
    profileLoading ||
    (enabled && query.isPending && !query.data);

  const refreshing = enabled && query.isRefetching && !query.isPending;

  const error =
    gateError ??
    (query.error ? getUserFacingMessage(query.error) : null);

  return {
    active: buckets.active,
    upcoming: buckets.upcoming,
    loading,
    refreshing,
    error,
    refetch,
    retry: refetch,
  };
}
