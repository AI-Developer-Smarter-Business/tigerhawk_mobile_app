import type { InfiniteData, QueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/lib/query/query-keys';
import type { DriverLoadsPageResult } from '@/lib/supabase/queries/loads';
import type { LoadDetail, LoadStatus } from '@/types';

/**
 * Optimistic status update in React Query (only via `runDriverStatusChange` when safe).
 * Roll back on API failure; invalidate after success for server truth.
 */
export function setLoadStatusInCache(
  queryClient: QueryClient,
  userId: string,
  loadId: string,
  status: LoadStatus,
): void {
  queryClient.setQueryData<LoadDetail | null>(
    queryKeys.loads.detail(userId, loadId),
    (current) => (current ? { ...current, status } : current),
  );

  queryClient.setQueryData<InfiniteData<DriverLoadsPageResult>>(
    queryKeys.loads.list(userId),
    (current) => {
      if (!current) return current;
      return {
        ...current,
        pages: current.pages.map((page) => ({
          ...page,
          loads: page.loads.map((load) =>
            load.id === loadId ? { ...load, status } : load,
          ),
        })),
      };
    },
  );
}
