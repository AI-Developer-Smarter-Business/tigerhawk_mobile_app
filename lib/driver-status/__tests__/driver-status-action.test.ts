import { QueryClient } from '@tanstack/react-query';

import { canOptimisticallyUpdateLoadStatus } from '@/lib/loads/optimistic-status';
import { patchLoadStatus } from '@/lib/tms';
import {
  buildStatusPatchBody,
  buildStatusPatchHeaders,
  buildStatusPatchPath,
} from '@/lib/tms/status-patch-request';

import { runDriverStatusChange } from '../run-driver-status-change';

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

describe('driver status action layer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPatch.mockResolvedValue(undefined);
  });

  it('uses the same path and payload builders as patchLoadStatus', () => {
    expect(buildStatusPatchPath('load-1')).toMatch(
      /^\/api\/dispatcher\/loads\/[^/]+\/status$/,
    );
    expect(buildStatusPatchBody('In Transit')).toBe(
      JSON.stringify({ status: 'In Transit' }),
    );
    expect(buildStatusPatchHeaders('tok').Authorization).toBe('Bearer tok');
  });

  it('only optimistically updates when canOptimisticallyUpdateLoadStatus is true', () => {
    expect(
      canOptimisticallyUpdateLoadStatus({
        from: 'Dispatched',
        to: 'In Transit',
        activeHolds: [],
      }),
    ).toBe(true);
    expect(
      canOptimisticallyUpdateLoadStatus({
        from: 'Dispatched',
        to: 'In Transit',
        activeHolds: ['freight_hold'],
      }),
    ).toBe(false);
  });

  it('runDriverStatusChange calls patchLoadStatus with load id, status, and token', async () => {
    const queryClient = new QueryClient();
    const updateLoadStatus = jest.fn();

    await runDriverStatusChange({
      queryClient,
      userId: 'user-1',
      load: { id: 'load-99', status: 'Dispatched', active_holds: [] },
      targetStatus: 'In Transit',
      accessToken: 'access-jwt',
      updateLoadStatus,
    });

    expect(mockPatch).toHaveBeenCalledWith({
      loadId: 'load-99',
      status: 'In Transit',
      accessToken: 'access-jwt',
    });
  });
});
