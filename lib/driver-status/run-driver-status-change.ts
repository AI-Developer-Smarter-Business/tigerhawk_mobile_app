import type { QueryClient } from '@tanstack/react-query';

import {
  invalidateDriverLoads,
  invalidateLoadDetail,
} from '@/lib/query/invalidate-loads';
import { driverStatusTelemetry } from '@/lib/telemetry';
import { patchLoadStatus } from '@/lib/tms';
import type { LoadDetail, LoadStatus } from '@/types';

export type RunDriverStatusChangeParams = {
  queryClient: QueryClient;
  userId: string;
  load: Pick<LoadDetail, 'id' | 'status' | 'active_holds'>;
  targetStatus: LoadStatus;
  accessToken: string;
};

/**
 * Drains status changes queued by app versions older than D.2.
 * Current driver screens use `/progress` and never call this function.
 * No mock transition map or optimistic status derivation is used.
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
  } = params;

  const telemetryBase = {
    loadId: load.id,
    from: load.status,
    to: targetStatus,
    optimistic: false,
  };

  const startedAt = Date.now();
  driverStatusTelemetry.attempt(telemetryBase);

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
    driverStatusTelemetry.failure(
      {
        ...telemetryBase,
        rolledBack: false,
        durationMs: Date.now() - startedAt,
      },
      error,
    );
    throw error;
  }
}
