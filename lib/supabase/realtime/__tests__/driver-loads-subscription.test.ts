import { createDriverLoadsRealtimeHandler } from '../driver-loads-subscription';

jest.mock('@/lib/query/refetch-active-driver-loads', () => ({
  refetchActiveDriverLoadQueries: jest.fn(() => Promise.resolve()),
}));

describe('createDriverLoadsRealtimeHandler', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('debounces refetch calls', async () => {
    const queryClient = {} as import('@tanstack/react-query').QueryClient;
    const { refetchActiveDriverLoadQueries } = jest.requireMock(
      '@/lib/query/refetch-active-driver-loads',
    );

    const handler = createDriverLoadsRealtimeHandler(queryClient, 'user-1', 300);
    handler.onChange('load-a');
    handler.onChange('load-b');
    handler.onDocumentsChange('load-docs');

    expect(refetchActiveDriverLoadQueries).not.toHaveBeenCalled();

    jest.advanceTimersByTime(300);
    await Promise.resolve();

    expect(refetchActiveDriverLoadQueries).toHaveBeenCalledTimes(1);
    expect(refetchActiveDriverLoadQueries).toHaveBeenCalledWith(queryClient, 'user-1');

    handler.dispose();
  });
});
