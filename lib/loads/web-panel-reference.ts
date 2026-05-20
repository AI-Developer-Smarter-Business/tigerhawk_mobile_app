import type { LoadStatus } from '@/types';

/**
 * Reference sets from TMS `DriverActionPanel.tsx` (read-only PROYECTO_MUESTRA).
 * Used by parity tests (task 3.7) — keep in sync when TMS driver panel changes.
 */
export const WEB_DRIVER_PANEL_FIELD_STATUSES: ReadonlySet<LoadStatus> = new Set([
  'Arrived At Pickup',
  'In Transit',
  'Arrived At Delivery',
  'Delivered',
  'At Warehouse',
  'Arrived To Hook Container',
  'Enroute To Drop Container',
  'Dropped - Loaded',
  'Dropped - Empty',
  'Enroute To Return Empty',
  'Arrived At Return Empty',
]);

export const WEB_DRIVER_PANEL_FINAL_STATUSES: ReadonlySet<LoadStatus> = new Set([
  'Completed',
  'Cancelled',
]);

/** Mirrors web panel: driver buttons only (no dispatcher/final). */
export function filterWebDriverPanelActions(nextStatuses: LoadStatus[]): LoadStatus[] {
  return nextStatuses.filter(
    (status) =>
      WEB_DRIVER_PANEL_FIELD_STATUSES.has(status) &&
      !WEB_DRIVER_PANEL_FINAL_STATUSES.has(status),
  );
}
