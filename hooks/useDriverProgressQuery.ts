import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';

import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { getUserFacingMessage } from '@/lib/errors';
import type { DriverLoadProgress } from '@/lib/loads/driver-progress';
import {
  getDriverQueryGateError,
  isDriverLoadsQueryEnabled,
} from '@/lib/query/driver-query-gate';
import { queryKeys } from '@/lib/query/query-keys';
import { fetchMobileDriverProgress } from '@/lib/tms/fetch-driver-progress';

export type UseDriverProgressQueryResult = {
  progress: DriverLoadProgress | null;
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  retry: () => Promise<void>;
};

/** Server-derived load progress for D.1/D.2 UI; no local status mapping. */
export function useDriverProgressQuery(
  loadId: string | undefined,
): UseDriverProgressQueryResult {
  const queryClient = useQueryClient();
  const { isSupabaseAuthenticated, isInitialized, session } = useAuth();
  const { isDriver, assignedDriverId, loading: profileLoading } = useProfile();
  const driverId = assignedDriverId ?? '';

  const gateError = getDriverQueryGateError({
    isSupabaseAuthenticated,
    profileLoading,
    isDriver,
  });
  const driverReady = isDriverLoadsQueryEnabled({
    isInitialized,
    isSupabaseAuthenticated,
    profileLoading,
    isDriver,
    driverId,
  });
  const enabled = driverReady && Boolean(loadId);
  const queryKey = useMemo(
    () => queryKeys.loads.progress(driverId, loadId ?? ''),
    [driverId, loadId],
  );

  const query = useQuery({
    queryKey,
    enabled,
    staleTime: 0,
    queryFn: async () => {
      if (!loadId) throw new Error('Load id is required.');
      const result = await fetchMobileDriverProgress({
        loadId,
        accessToken: session?.access_token,
      });
      if (!result.ok) {
        throw result.mobileError ?? new Error(result.error);
      }
      return result.progress;
    },
  });

  const refetch = useCallback(async () => {
    if (!enabled) return;
    await queryClient.invalidateQueries({ queryKey });
    await query.refetch();
  }, [enabled, query.refetch, queryClient, queryKey]);

  return {
    progress: enabled ? (query.data ?? null) : null,
    loading:
      !isInitialized ||
      profileLoading ||
      (enabled && query.isPending && !query.data),
    refreshing: enabled && query.isRefetching && !query.isPending,
    error: gateError ?? (query.error ? getUserFacingMessage(query.error) : null),
    refetch,
    retry: refetch,
  };
}
