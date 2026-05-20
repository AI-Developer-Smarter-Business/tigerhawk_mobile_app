import type { QueryClient } from '@tanstack/react-query';

import { canOptimisticallyUpdateLoadStatus } from '@/lib/loads/optimistic-status';
import {
  invalidateDriverLoads,
  invalidateLoadDetail,
} from '@/lib/query/invalidate-loads';
import { setLoadStatusInCache } from '@/lib/query/patch-load-status';
import { driverStatusTelemetry } from '@/lib/telemetry';
import { patchLoadStatus } from '@/lib/tms';
import type { LoadDetail, LoadStatus } from '@/types';

export type RunDriverStatusChangeParams = {
  queryClient: QueryClient;
  userId: string;
  load: Pick<LoadDetail, 'id' | 'status' | 'active_holds'>;
  targetStatus: LoadStatus;
  accessToken: string;
  updateLoadStatus: (id: string, status: LoadStatus) => void;
};

/**
 * Driver status change with optimistic cache only when safe (task 3.5).
 * On API failure after optimistic apply, rolls back React Query + LoadsContext.
 */
export async function runDriverStatusChange(
  params: RunDriverStatusChangeParams,
): Promise<void> {
  const {
    queryClient,
    userId,
    load,
    targetStatus,
    accessToken,
    updateLoadStatus,
  } = params;

  const previousStatus = load.status;
  const optimistic = canOptimisticallyUpdateLoadStatus({
    from: previousStatus,
    to: targetStatus,
    activeHolds: load.active_holds,
  });

  const telemetryBase = {
    loadId: load.id,
    from: previousStatus,
    to: targetStatus,
    optimistic,
  };

  const startedAt = Date.now();
  driverStatusTelemetry.attempt(telemetryBase);

  if (optimistic) {
    setLoadStatusInCache(queryClient, userId, load.id, targetStatus);
    updateLoadStatus(load.id, targetStatus);
  }

  try {
    await patchLoadStatus({
      loadId: load.id,
      status: targetStatus,
      accessToken,
    });
    await Promise.all([
      invalidateLoadDetail(queryClient, userId, load.id),
      invalidateDriverLoads(queryClient, userId),
    ]);
    driverStatusTelemetry.success({
      ...telemetryBase,
      durationMs: Date.now() - startedAt,
    });
  } catch (error) {
    if (optimistic) {
      setLoadStatusInCache(queryClient, userId, load.id, previousStatus);
      updateLoadStatus(load.id, previousStatus);
    }
    driverStatusTelemetry.failure(
      {
        ...telemetryBase,
        rolledBack: optimistic,
        durationMs: Date.now() - startedAt,
      },
      error,
    );
    throw error;
  }
}
