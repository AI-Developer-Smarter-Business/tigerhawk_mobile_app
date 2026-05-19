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
import { fetchLoadDetailForDriver } from '@/lib/supabase/queries';
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

export function useLoadDetailQuery(loadId: string | undefined): UseLoadDetailQueryResult {
  const queryClient = useQueryClient();
  const { user, isSupabaseAuthenticated, isInitialized } = useAuth();
  const { profile, isDriver, loading: profileLoading } = useProfile();
  const { getLoadById } = useLoads();

  const userId = user?.id ?? '';
  const cachedLoad = loadId ? getLoadById(loadId) : undefined;

  const gateError = getDriverQueryGateError({
    isSupabaseAuthenticated,
    profileLoading,
    isDriver,
    hasProfile: profile != null,
  });

  const enabled =
    isDriverLoadsQueryEnabled({
      isInitialized,
      isSupabaseAuthenticated,
      profileLoading,
      isDriver,
      userId,
    }) && Boolean(loadId);

  const query = useQuery({
    queryKey: queryKeys.loads.detail(userId, loadId ?? ''),
    enabled,
    placeholderData: cachedLoad,
    queryFn: async (): Promise<LoadDetail | null> => {
      const result = await fetchLoadDetailForDriver(
        getSupabase(),
        loadId!,
        userId,
      );
      if (result.errorMessage) {
        throw new Error(result.errorMessage);
      }
      return result.load;
    },
  });

  const invalidateAndRefetch = useCallback(async () => {
    if (userId && loadId) {
      await invalidateLoadDetail(queryClient, userId, loadId);
    }
    await query.refetch();
  }, [query, queryClient, userId, loadId]);

  const refetch = invalidateAndRefetch;
  const retry = refetch;

  const loading =
    !loadId ||
    !isInitialized ||
    profileLoading ||
    (enabled && query.isPending && query.data === undefined);

  const refreshing = query.isRefetching;
  const fetchedLoad = query.data ?? null;
  const displayLoad = fetchedLoad ?? cachedLoad ?? null;

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
