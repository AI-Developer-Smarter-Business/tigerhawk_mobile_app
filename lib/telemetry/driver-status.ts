import { safeLog } from '@/lib/logging/safe-log';
import { TmsStatusChangeError } from '@/lib/tms/errors';
import type { LoadStatus } from '@/types';

const SCOPE = 'driver.status';

export type DriverStatusTelemetryMeta = {
  loadId: string;
  from: LoadStatus;
  to: LoadStatus;
  optimistic: boolean;
};

function statusErrorCode(error: unknown): string | undefined {
  if (error instanceof TmsStatusChangeError) return error.code;
  return undefined;
}

/** Dev-only structured events for driver status changes (task 3.5). */
export const driverStatusTelemetry = {
  attempt(meta: DriverStatusTelemetryMeta): void {
    safeLog.event(SCOPE, 'attempt', meta);
  },
  success(meta: DriverStatusTelemetryMeta & { durationMs: number }): void {
    safeLog.event(SCOPE, 'success', meta);
  },
  failure(
    meta: DriverStatusTelemetryMeta & { rolledBack: boolean; durationMs: number },
    error: unknown,
  ): void {
    safeLog.event(SCOPE, 'failure', {
      ...meta,
      code: statusErrorCode(error),
    });
  },
};
