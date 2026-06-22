import type { LoadStatus } from '@/types';

/** Product rules: `docs/WAIT_TIME_OVERAGE_SPEC.md` (WT.34). Invoice label: `docs/WAIT_TIME_INVOICE_LABEL.md` (WT.25). */

/** Default free waiting period before billable time (minutes). */
export const DEFAULT_FREE_WAIT_MINUTES = 60;

/** Matches Postgres trigger default on `waiting_time_events.driver_rate_per_hour`. */
export const DEFAULT_DRIVER_WAIT_RATE_PER_HOUR = 75;

export const DELIVERY_WAIT_EVENT = 'delivery_wait' as const;

/**
 * Load status where the driver may manually start delivery wait time (WT.27).
 * Timer does not start automatically on this transition.
 */
export const DELIVERY_WAIT_ELIGIBLE_STATUS: LoadStatus = 'Arrived At Delivery';

/** @deprecated Use DELIVERY_WAIT_ELIGIBLE_STATUS — kept for existing imports. */
export const DELIVERY_WAIT_START_STATUS = DELIVERY_WAIT_ELIGIBLE_STATUS;

/**
 * Legacy statuses that previously auto-stopped the mobile timer.
 * Mobile no longer auto-stops on status change (WT.27); e-POD auto-stop is WT.28.
 */
export const DELIVERY_WAIT_STOP_STATUSES: ReadonlySet<LoadStatus> = new Set([
  'Delivered',
  'Dropped - Loaded',
  'Completed',
  'Cancelled',
  'In Transit',
]);

/** @deprecated Not used for mobile auto-stop after WT.27. */
export function shouldStopDeliveryWait(status: LoadStatus): boolean {
  return DELIVERY_WAIT_STOP_STATUSES.has(status);
}

export function isDeliveryWaitEligibleStatus(status: LoadStatus): boolean {
  return status === DELIVERY_WAIT_ELIGIBLE_STATUS;
}

/** @deprecated Manual start only (WT.27). */
export function shouldStartDeliveryWait(
  previous: LoadStatus | null | undefined,
  next: LoadStatus,
): boolean {
  return next === DELIVERY_WAIT_ELIGIBLE_STATUS && previous !== DELIVERY_WAIT_ELIGIBLE_STATUS;
}
