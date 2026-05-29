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
  const queryKey = queryKeys.loads.list(userId);
  // Reset infinite list to page 0, then refetch active observers (reset alone can leave stale UI).
  await queryClient.resetQueries({ queryKey });
  await queryClient.refetchQueries({ queryKey, type: 'active' });
}

export async function invalidateLoadDocuments(
  queryClient: QueryClient,
  userId: string,
  loadId: string,
): Promise<void> {
  const documentsKey = queryKeys.loads.documents(userId, loadId);
  await queryClient.invalidateQueries({
    queryKey: documentsKey,
    refetchType: 'active',
  });
  await queryClient.refetchQueries({ queryKey: documentsKey, type: 'active' });
}

export async function invalidateLoadDetail(
  queryClient: QueryClient,
  userId: string,
  loadId: string,
): Promise<void> {
  const detailKey = queryKeys.loads.detail(userId, loadId);
  await Promise.all([
    queryClient.invalidateQueries({
      queryKey: detailKey,
      refetchType: 'active',
    }),
    invalidateLoadDocuments(queryClient, userId, loadId),
  ]);
  await queryClient.refetchQueries({ queryKey: detailKey, type: 'active' });
}
