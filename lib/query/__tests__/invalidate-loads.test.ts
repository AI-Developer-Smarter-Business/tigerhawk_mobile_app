import { QueryClient } from '@tanstack/react-query';

import {
  invalidateDriverLoads,
  invalidateLoadProgress,
} from '@/lib/query/invalidate-loads';
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

describe('invalidateLoadProgress', () => {
  it('invalidates and refetches the active semantic progress query', async () => {
    const queryClient = new QueryClient();
    const invalidateSpy = jest
      .spyOn(queryClient, 'invalidateQueries')
      .mockResolvedValue();
    const refetchSpy = jest
      .spyOn(queryClient, 'refetchQueries')
      .mockResolvedValue();

    await invalidateLoadProgress(queryClient, 'driver-1', 'load-1');

    const queryKey = queryKeys.loads.progress('driver-1', 'load-1');
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey,
      refetchType: 'active',
    });
    expect(refetchSpy).toHaveBeenCalledWith({ queryKey, type: 'active' });

    invalidateSpy.mockRestore();
    refetchSpy.mockRestore();
  });
});
