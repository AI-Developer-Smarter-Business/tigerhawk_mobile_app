import type { QueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/lib/query/query-keys';

/** Force-refetch every mounted driver load query (list, detail, documents). */
export async function refetchActiveDriverLoadQueries(
  queryClient: QueryClient,
  userId: string,
): Promise<void> {
  await queryClient.refetchQueries({
    queryKey: queryKeys.loads.all(userId),
    type: 'active',
  });
}
