import type { LoadStatus } from '@/types';

/** Default free waiting period before billable time (minutes). */
export const DEFAULT_FREE_WAIT_MINUTES = 60;

export const DELIVERY_WAIT_EVENT = 'delivery_wait' as const;

/** Status that starts the delivery wait timer. */
export const DELIVERY_WAIT_START_STATUS: LoadStatus = 'Arrived At Delivery';

/** Statuses that stop an active delivery wait timer. */
export const DELIVERY_WAIT_STOP_STATUSES: ReadonlySet<LoadStatus> = new Set([
  'Delivered',
  'Dropped - Loaded',
  'Completed',
  'Cancelled',
  'In Transit',
]);

export function shouldStopDeliveryWait(status: LoadStatus): boolean {
  return DELIVERY_WAIT_STOP_STATUSES.has(status);
}

export function shouldStartDeliveryWait(
  previous: LoadStatus | null | undefined,
  next: LoadStatus,
): boolean {
  return next === DELIVERY_WAIT_START_STATUS && previous !== DELIVERY_WAIT_START_STATUS;
}
