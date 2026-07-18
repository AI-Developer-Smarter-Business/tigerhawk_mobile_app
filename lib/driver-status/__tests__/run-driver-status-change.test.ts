import { QueryClient } from '@tanstack/react-query';

import { runDriverStatusChange } from '../run-driver-status-change';
import { queryKeys } from '@/lib/query/query-keys';
import { driverStatusTelemetry } from '@/lib/telemetry';
import { patchLoadStatus } from '@/lib/tms';
import { TmsStatusChangeError } from '@/lib/tms/errors';
import type { LoadDetail } from '@/types';

jest.mock('@/lib/tms', () => ({
  patchLoadStatus: jest.fn(),
}));

jest.mock('@/lib/query/invalidate-loads', () => ({
  invalidateLoadDetail: jest.fn().mockResolvedValue(undefined),
  invalidateDriverLoads: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('@/lib/telemetry', () => ({
  driverStatusTelemetry: {
    attempt: jest.fn(),
    success: jest.fn(),
    failure: jest.fn(),
  },
}));

const mockPatch = patchLoadStatus as jest.MockedFunction<typeof patchLoadStatus>;

const baseLoad: Pick<LoadDetail, 'id' | 'status' | 'active_holds'> = {
  id: 'load-1',
  status: 'Dispatched',
  active_holds: [],
};

describe('runDriverStatusChange', () => {
  let queryClient: QueryClient;
  const userId = 'user-1';

  beforeEach(() => {
    jest.clearAllMocks();
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    queryClient.setQueryData(queryKeys.loads.detail(userId, baseLoad.id), {
      ...baseLoad,
      reference_number: 'REF-1',
    } as LoadDetail);
  });

  it('does not derive or optimistically update status for a legacy queue failure', async () => {
    mockPatch.mockRejectedValueOnce(
      new TmsStatusChangeError('Forbidden', 'FORBIDDEN'),
    );

    await expect(
      runDriverStatusChange({
        queryClient,
        userId,
        load: baseLoad,
        targetStatus: 'In Transit',
        accessToken: 'token',
      }),
    ).rejects.toThrow('Forbidden');

    const detail = queryClient.getQueryData<LoadDetail>(
      queryKeys.loads.detail(userId, baseLoad.id),
    );
    expect(detail?.status).toBe('Dispatched');

    expect(driverStatusTelemetry.attempt).toHaveBeenCalledWith(
      expect.objectContaining({ optimistic: false }),
    );
    expect(driverStatusTelemetry.failure).toHaveBeenCalledWith(
      expect.objectContaining({ rolledBack: false }),
      expect.any(TmsStatusChangeError),
    );
  });

  it('invalidates server state after draining a legacy queue item', async () => {
    mockPatch.mockResolvedValueOnce(undefined);

    await runDriverStatusChange({
      queryClient,
      userId,
      load: { ...baseLoad, active_holds: ['freight_hold'] },
      targetStatus: 'In Transit',
      accessToken: 'token',
    });

    expect(driverStatusTelemetry.attempt).toHaveBeenCalledWith(
      expect.objectContaining({ optimistic: false }),
    );
    expect(driverStatusTelemetry.success).toHaveBeenCalled();
  });
});
