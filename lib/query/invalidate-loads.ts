import type { QueryClient } from '@tanstack/react-query';

import { queryKeys } from './query-keys';

/**
 * Resets the infinite loads list to page 0 (avoids refetching every scrolled page
 * after bulk TMS assigns or Realtime bursts — main cause of list "lag").
 */
export async function invalidateDriverLoads(
  queryClient: QueryClient,
  driverId: string,
): Promise<void> {
  const listKey = queryKeys.loads.list(driverId);
  const bucketsKey = queryKeys.loads.mobileBuckets(driverId);
  const historyPrefix = [...queryKeys.loads.all(driverId), 'mobile-history'] as const;
  await Promise.all([
    queryClient.resetQueries({ queryKey: listKey }),
    queryClient.invalidateQueries({ queryKey: bucketsKey }),
    queryClient.invalidateQueries({ queryKey: historyPrefix }),
  ]);
  await Promise.all([
    queryClient.refetchQueries({ queryKey: listKey, type: 'active' }),
    queryClient.refetchQueries({ queryKey: bucketsKey, type: 'active' }),
    queryClient.refetchQueries({ queryKey: historyPrefix, type: 'active' }),
  ]);
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

export async function invalidateLoadProgress(
  queryClient: QueryClient,
  driverId: string,
  loadId: string,
): Promise<void> {
  const progressKey = queryKeys.loads.progress(driverId, loadId);
  await queryClient.invalidateQueries({
    queryKey: progressKey,
    refetchType: 'active',
  });
  await queryClient.refetchQueries({ queryKey: progressKey, type: 'active' });
}

export async function invalidateLoadDetail(
  queryClient: QueryClient,
  userId: string,
  loadId: string,
): Promise<void> {
  /** Prefix matches every move-scoped detail key for this load. */
  const detailKey = [...queryKeys.loads.all(userId), 'detail', loadId] as const;
  await Promise.all([
    queryClient.invalidateQueries({
      queryKey: detailKey,
      refetchType: 'active',
    }),
    invalidateLoadDocuments(queryClient, userId, loadId),
  ]);
  await queryClient.refetchQueries({ queryKey: detailKey, type: 'active' });
}
