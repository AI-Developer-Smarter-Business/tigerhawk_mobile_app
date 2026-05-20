import type { QueryClient } from '@tanstack/react-query';

import { queryKeys } from './query-keys';

/**
 * Resets the infinite loads list to page 0 (avoids refetching every scrolled page
 * after bulk TMS assigns or Realtime bursts — main cause of list "lag").
 */
export async function invalidateDriverLoads(
  queryClient: QueryClient,
  userId: string,
): Promise<void> {
  await queryClient.resetQueries({
    queryKey: queryKeys.loads.list(userId),
  });
}

export async function invalidateLoadDetail(
  queryClient: QueryClient,
  userId: string,
  loadId: string,
): Promise<void> {
  await queryClient.invalidateQueries({
    queryKey: queryKeys.loads.detail(userId, loadId),
  });
}
