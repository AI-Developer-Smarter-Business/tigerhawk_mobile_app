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

/**
 * Static transition map (subset of TMS `VALID_LOAD_TRANSITIONS`).
 * Used to preview next steps until `GET /api/admin/transitions` is wired.
 * @see docs/MOBILE_API.md
 */
export const MOCK_LOAD_TRANSITIONS: Record<LoadStatus, LoadStatus[]> = {
  Assigned: ['Dispatched', 'Cancelled'],
  Dispatched: ['In Transit', 'Arrived At Pickup', 'Arrived To Hook Container', 'Cancelled'],
  'In Transit': ['Arrived At Delivery', 'At Warehouse', 'Delivered', 'Cancelled'],
  'Arrived At Pickup': ['In Transit', 'Cancelled'],
  'Arrived At Delivery': ['Delivered', 'Dropped - Loaded', 'Cancelled'],
  'Arrived At Return Empty': ['Completed', 'Cancelled'],
  'Arrived To Hook Container': ['In Transit', 'Enroute To Drop Container', 'Cancelled'],
  'At Warehouse': ['In Transit', 'Delivered', 'Cancelled'],
  'Dropped - Empty': ['Enroute To Return Empty', 'Completed', 'Cancelled'],
  'Dropped - Loaded': ['Enroute To Return Empty', 'Cancelled'],
  'Enroute To Drop Container': ['Arrived At Delivery', 'Dropped - Loaded', 'Cancelled'],
  'Enroute To Return Empty': ['Arrived At Return Empty', 'Completed', 'Cancelled'],
  Delivered: ['Completed', 'Enroute To Return Empty', 'Cancelled'],
  Completed: [],
  Cancelled: [],
};
