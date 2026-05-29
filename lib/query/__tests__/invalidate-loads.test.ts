import { QueryClient } from '@tanstack/react-query';

import { invalidateDriverLoads } from '@/lib/query/invalidate-loads';
import { queryKeys } from '@/lib/query/query-keys';

describe('invalidateDriverLoads', () => {
  it('resets list cache and refetches active observers', async () => {
    const queryClient = new QueryClient();
    const resetSpy = jest.spyOn(queryClient, 'resetQueries').mockResolvedValue();
    const refetchSpy = jest.spyOn(queryClient, 'refetchQueries').mockResolvedValue();

    await invalidateDriverLoads(queryClient, 'user-1');

    const queryKey = queryKeys.loads.list('user-1');
    expect(resetSpy).toHaveBeenCalledWith({ queryKey });
    expect(refetchSpy).toHaveBeenCalledWith({ queryKey, type: 'active' });

    resetSpy.mockRestore();
    refetchSpy.mockRestore();
  });
});
