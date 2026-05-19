import { createDriverLoadsRealtimeHandler } from '../driver-loads-subscription';

jest.mock('@/lib/query/invalidate-loads', () => ({
  invalidateDriverLoads: jest.fn(() => Promise.resolve()),
  invalidateLoadDetail: jest.fn(() => Promise.resolve()),
}));

describe('createDriverLoadsRealtimeHandler', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('debounces invalidate calls', async () => {
    const queryClient = {} as import('@tanstack/react-query').QueryClient;
    const { invalidateDriverLoads } = jest.requireMock(
      '@/lib/query/invalidate-loads',
    );

    const handler = createDriverLoadsRealtimeHandler(queryClient, 'user-1', 300);
    handler.onChange('load-a');
    handler.onChange('load-b');

    expect(invalidateDriverLoads).not.toHaveBeenCalled();

    jest.advanceTimersByTime(300);
    await Promise.resolve();

    expect(invalidateDriverLoads).toHaveBeenCalledTimes(1);
    expect(invalidateDriverLoads).toHaveBeenCalledWith(queryClient, 'user-1');

    handler.dispose();
  });
});
