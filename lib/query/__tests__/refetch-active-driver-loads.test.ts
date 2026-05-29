import { QueryClient } from '@tanstack/react-query';

import { refetchActiveDriverLoadQueries } from '@/lib/query/refetch-active-driver-loads';
import { queryKeys } from '@/lib/query/query-keys';

describe('refetchActiveDriverLoadQueries', () => {
  it('refetches all active driver load queries', async () => {
    const queryClient = new QueryClient();
    const refetchSpy = jest.spyOn(queryClient, 'refetchQueries').mockResolvedValue();

    await refetchActiveDriverLoadQueries(queryClient, 'user-1');

    expect(refetchSpy).toHaveBeenCalledWith({
      queryKey: queryKeys.loads.all('user-1'),
      type: 'active',
    });

    refetchSpy.mockRestore();
  });
});
