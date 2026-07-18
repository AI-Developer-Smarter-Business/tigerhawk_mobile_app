import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

import { useLoads } from '@/context/LoadsContext';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import {
  getDriverQueryGateError,
  isDriverLoadsQueryEnabled,
} from '@/lib/query/driver-query-gate';
import { invalidateLoadDetail } from '@/lib/query/invalidate-loads';
import { queryKeys } from '@/lib/query/query-keys';
import { getUserFacingMessage } from '@/lib/errors';
import { resolveLoadDetailForDriver } from '@/lib/loads/resolve-load-detail-for-driver';
import { getSupabase } from '@/lib/supabase/client';
import type { LoadDetail } from '@/types';

export type UseLoadDetailQueryResult = {
  load: LoadDetail | null;
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  notFound: boolean;
  refetch: () => Promise<void>;
  retry: () => Promise<void>;
};

export function useLoadDetailQuery(
  loadId: string | undefined,
  moveId?: string,
): UseLoadDetailQueryResult {
  const queryClient = useQueryClient();
  const { isSupabaseAuthenticated, isInitialized, session } = useAuth();
  const { isDriver, assignedDriverId, loading: profileLoading } = useProfile();
  const { getLoadById } = useLoads();

  const driverId = assignedDriverId ?? '';
  const cachedLoad = loadId ? getLoadById(loadId) : undefined;

  const gateError = getDriverQueryGateError({
    isSupabaseAuthenticated,
    profileLoading,
    isDriver,
  });

  const enabled =
    isDriverLoadsQueryEnabled({
      isInitialized,
      isSupabaseAuthenticated,
      profileLoading,
      isDriver,
      driverId,
    }) && Boolean(loadId);

  const detailMoveId = moveId?.trim() ?? '';

  const query = useQuery({
    queryKey: queryKeys.loads.detail(driverId, loadId ?? '', detailMoveId),
    enabled,
    staleTime: 0,
    queryFn: async (): Promise<LoadDetail | null> => {
      const result = await resolveLoadDetailForDriver({
        supabase: getSupabase(),
        queryClient,
        loadId: loadId!,
        driverId,
        moveId,
        accessToken: session?.access_token,
      });
      if (result.errorMessage) {
        throw new Error(result.errorMessage);
      }
      return result.load;
    },
  });

  const invalidateAndRefetch = useCallback(async () => {
    if (driverId && loadId) {
      await invalidateLoadDetail(queryClient, driverId, loadId);
    }
    await query.refetch();
  }, [query, queryClient, driverId, loadId]);

  const refetch = invalidateAndRefetch;
  const retry = refetch;

  const loading =
    !loadId ||
    !isInitialized ||
    profileLoading ||
    (enabled && query.isPending && query.data === undefined);

  const refreshing = enabled && query.isRefetching;
  const fetchedLoad = query.data ?? null;
  const displayLoad =
    fetchedLoad ??
    ((!query.isSuccess || query.isPending) && cachedLoad ? cachedLoad : null);

  const error = gateError ?? (query.error ? getUserFacingMessage(query.error) : null);

  const notFound =
    Boolean(loadId) &&
    enabled &&
    query.isSuccess &&
    fetchedLoad === null &&
    !cachedLoad;

  return {
    load: displayLoad,
    loading,
    refreshing,
    error,
    notFound,
    refetch,
    retry,
  };
}
