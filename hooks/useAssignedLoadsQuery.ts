import { keepPreviousData, useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';

import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import {
  getDriverQueryGateError,
  isDriverLoadsQueryEnabled,
} from '@/lib/query/driver-query-gate';
import { invalidateDriverLoads } from '@/lib/query/invalidate-loads';
import { queryKeys } from '@/lib/query/query-keys';
import { sortAssignedLoadsByPriority } from '@/lib/loads/sort-assigned-loads';
import { dedupeLoadsById } from '@/lib/supabase/queries/map-load-row';
import { getUserFacingMessage } from '@/lib/errors';
import { fetchDriverLoadsPage } from '@/lib/supabase/queries';
import { getSupabase } from '@/lib/supabase/client';
import type { DriverLoadsPageResult } from '@/lib/supabase/queries/loads';
import type { LoadDetail } from '@/types';

export type UseAssignedLoadsQueryResult = {
  loads: LoadDetail[];
  loading: boolean;
  refreshing: boolean;
  loadingMore: boolean;
  error: string | null;
  hasMore: boolean;
  totalCount: number | null;
  refetch: () => Promise<void>;
  loadMore: () => Promise<void>;
  retry: () => Promise<void>;
};

export function useAssignedLoadsQuery(): UseAssignedLoadsQueryResult {
  const queryClient = useQueryClient();
  const { isSupabaseAuthenticated, isInitialized } = useAuth();
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

  const query = useInfiniteQuery({
    queryKey: queryKeys.loads.list(driverId),
    enabled,
    staleTime: 0,
    placeholderData: keepPreviousData,
    initialPageParam: 0,
    queryFn: async ({ pageParam }): Promise<DriverLoadsPageResult> => {
      const result = await fetchDriverLoadsPage(getSupabase(), driverId, {
        page: pageParam,
      });
      if (result.errorMessage) {
        throw new Error(result.errorMessage);
      }
      return result;
    },
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.page + 1 : undefined,
  });
  const loads = useMemo(() => {
    const flat = query.data?.pages.flatMap((page) => page.loads) ?? [];
    return sortAssignedLoadsByPriority(dedupeLoadsById(flat));
  }, [query.data]);

  const lastPage = query.data?.pages[query.data.pages.length - 1];
  const hasMore = lastPage?.hasMore ?? false;
  const totalCount = query.data?.pages[0]?.totalCount ?? null;

  const invalidateAndRefetch = useCallback(async () => {
    if (driverId) {
      await invalidateDriverLoads(queryClient, driverId);
    }
    await query.refetch();
  }, [query, queryClient, driverId]);

  const refetch = useCallback(async () => {
    await invalidateAndRefetch();
  }, [invalidateAndRefetch]);

  const retry = refetch;

  const loadMore = useCallback(async () => {
    if (!hasMore || query.isFetchingNextPage) {
      return;
    }
    await query.fetchNextPage();
  }, [hasMore, query]);

  const loading =
    !isInitialized ||
    profileLoading ||
    (enabled && query.isPending && loads.length === 0);

  const refreshing = enabled && query.isRefetching && !query.isFetchingNextPage;

  const error =
    gateError ?? (query.error ? getUserFacingMessage(query.error) : null);

  return {
    loads,
    loading,
    refreshing,
    loadingMore: query.isFetchingNextPage,
    error,
    hasMore,
    totalCount,
    refetch,
    loadMore,
    retry,
  };
}
