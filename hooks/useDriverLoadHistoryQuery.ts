import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';

import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { getUserFacingMessage } from '@/lib/errors';
import type { LoadHistoryDateRange } from '@/lib/loads/load-history-date-range';
import { toLoadHistoryQueryDates } from '@/lib/loads/load-history-date-range';
import type { DriverMoveCard } from '@/lib/loads/driver-move-card';
import {
  getDriverQueryGateError,
  isDriverLoadsQueryEnabled,
} from '@/lib/query/driver-query-gate';
import { queryKeys } from '@/lib/query/query-keys';
import { fetchMobileDriverLoadHistory } from '@/lib/tms/fetch-driver-load-history';

export type UseDriverLoadHistoryQueryParams = {
  dateRange: LoadHistoryDateRange;
  search: string;
};

export type UseDriverLoadHistoryQueryResult = {
  history: DriverMoveCard[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  retry: () => Promise<void>;
};

/**
 * Completed moves from `GET /api/mobile/driver/loads/history` (TASKS B.4).
 */
export function useDriverLoadHistoryQuery(
  params: UseDriverLoadHistoryQueryParams,
): UseDriverLoadHistoryQueryResult {
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

  const { from, to } = useMemo(
    () => toLoadHistoryQueryDates(params.dateRange),
    [params.dateRange],
  );
  const search = params.search.trim();

  const query = useQuery({
    queryKey: queryKeys.loads.mobileHistory(driverId, from, to, search),
    enabled,
    staleTime: 0,
    queryFn: async () => {
      const result = await fetchMobileDriverLoadHistory({
        from,
        to,
        q: search || undefined,
        accessToken: session?.access_token,
      });
      if (!result.ok) {
        throw result.mobileError ?? new Error(result.error);
      }
      return result.history;
    },
  });

  const history = enabled ? (query.data ?? []) : [];

  const refetch = useCallback(async () => {
    if (!enabled) return;
    await queryClient.invalidateQueries({
      queryKey: queryKeys.loads.mobileHistory(driverId, from, to, search),
    });
    await query.refetch();
  }, [enabled, queryClient, driverId, from, to, search, query]);

  const loading =
    !isInitialized ||
    profileLoading ||
    (enabled && query.isPending && !query.data);

  const refreshing = enabled && query.isRefetching && !query.isPending;

  const error =
    gateError ?? (query.error ? getUserFacingMessage(query.error) : null);

  return {
    history,
    loading,
    refreshing,
    error,
    refetch,
    retry: refetch,
  };
}
