import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';

import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import {
  getDriverQueryGateError,
  isDriverLoadsQueryEnabled,
} from '@/lib/query/driver-query-gate';
import { invalidateDriverLoads } from '@/lib/query/invalidate-loads';
import { queryKeys } from '@/lib/query/query-keys';
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
  const { user, isSupabaseAuthenticated, isInitialized } = useAuth();
  const { profile, isDriver, loading: profileLoading } = useProfile();

  const userId = user?.id ?? '';
  const gateError = getDriverQueryGateError({
    isSupabaseAuthenticated,
    profileLoading,
    isDriver,
    hasProfile: profile != null,
  });

  const enabled = isDriverLoadsQueryEnabled({
    isInitialized,
    isSupabaseAuthenticated,
    profileLoading,
    isDriver,
    userId,
  });

  const query = useInfiniteQuery({
    queryKey: queryKeys.loads.list(userId),
    enabled,
    initialPageParam: 0,
    queryFn: async ({ pageParam }): Promise<DriverLoadsPageResult> => {
      const result = await fetchDriverLoadsPage(getSupabase(), userId, {
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
    return dedupeLoadsById(flat);
  }, [query.data]);

  const lastPage = query.data?.pages[query.data.pages.length - 1];
  const hasMore = lastPage?.hasMore ?? false;
  const totalCount = query.data?.pages[0]?.totalCount ?? null;

  const invalidateAndRefetch = useCallback(async () => {
    if (userId) {
      await invalidateDriverLoads(queryClient, userId);
    }
    await query.refetch();
  }, [query, queryClient, userId]);

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

  const refreshing = query.isRefetching && !query.isFetchingNextPage;

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
