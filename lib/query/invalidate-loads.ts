import type { QueryClient } from '@tanstack/react-query';

import { queryKeys } from './query-keys';

/** Invalidates paginated list + all load detail queries for the driver. */
export async function invalidateDriverLoads(
  queryClient: QueryClient,
  userId: string,
): Promise<void> {
  await queryClient.invalidateQueries({
    queryKey: queryKeys.loads.all(userId),
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
