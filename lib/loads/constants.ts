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
 * Static transition map — aligned to TMS `VALID_LOAD_TRANSITIONS` (driver-relevant keys).
 * Fallback when `/api/dispatcher/transitions` is unavailable.
 * @see docs/MOBILE_API.md
 */
export const MOCK_LOAD_TRANSITIONS: Record<LoadStatus, LoadStatus[]> = {
  Assigned: ['Dispatched', 'Cancelled'],
  Dispatched: [
    'In Transit',
    'Arrived At Pickup',
    'Arrived To Hook Container',
    'Cancelled',
  ],
  'In Transit': [
    'Arrived At Delivery',
    'At Warehouse',
    'Delivered',
    'Dispatched',
    'Cancelled',
  ],
  'Arrived At Pickup': ['In Transit', 'Dispatched', 'Cancelled'],
  'Arrived At Delivery': ['Delivered', 'Dropped - Loaded', 'In Transit', 'Cancelled'],
  'Arrived At Return Empty': ['Completed', 'In Transit', 'Cancelled'],
  'Arrived To Hook Container': [
    'In Transit',
    'Enroute To Drop Container',
    'Dispatched',
    'Cancelled',
  ],
  'At Warehouse': ['In Transit', 'Delivered', 'Cancelled'],
  'Dropped - Empty': [
    'Arrived To Hook Container',
    'Enroute To Return Empty',
    'Completed',
    'Cancelled',
  ],
  'Dropped - Loaded': [
    'Enroute To Return Empty',
    'Dropped - Empty',
    'Completed',
    'Cancelled',
  ],
  'Enroute To Drop Container': [
    'Arrived At Delivery',
    'Dropped - Loaded',
    'Dropped - Empty',
    'Cancelled',
  ],
  'Enroute To Return Empty': ['Arrived At Return Empty', 'Completed', 'Cancelled'],
  Delivered: [
    'Completed',
    'Arrived At Return Empty',
    'Enroute To Return Empty',
    'Dropped - Empty',
    'In Transit',
    'Cancelled',
  ],
  Completed: [],
  Cancelled: [],
};
