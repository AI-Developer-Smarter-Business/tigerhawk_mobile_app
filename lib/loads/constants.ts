import type { LoadStatus } from '@/types';

/**
 * Field statuses a driver may trigger (TMS `DriverActionPanel.tsx` → `DRIVER_STATUSES`).
 * PP2 shows only these — not dispatcher-only or terminal actions.
 */
export const DRIVER_FIELD_STATUSES: ReadonlySet<LoadStatus> = new Set([
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

/** Terminal statuses — hidden from driver action bar (TMS `FINAL_STATUSES`). */
export const FINAL_LOAD_STATUSES: ReadonlySet<LoadStatus> = new Set([
  'Completed',
  'Cancelled',
]);
