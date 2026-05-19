import type { LoadStatus } from '@/types';

import {
  DRIVER_FIELD_STATUSES,
  FINAL_LOAD_STATUSES,
  MOCK_LOAD_TRANSITIONS,
} from './constants';

/**
 * Keeps only driver-field transitions (excludes dispatcher-only and terminal statuses).
 * Mirrors TMS `DriverActionPanel` driver button group.
 */
export function filterDriverFieldActions(nextStatuses: LoadStatus[]): LoadStatus[] {
  return nextStatuses.filter(
    (status) =>
      DRIVER_FIELD_STATUSES.has(status) && !FINAL_LOAD_STATUSES.has(status),
  );
}

/** Field actions visible for the current status (no dispatch/final buttons). */
export function getDriverActionsForStatus(status: LoadStatus): LoadStatus[] {
  const next = MOCK_LOAD_TRANSITIONS[status] ?? [];
  return filterDriverFieldActions(next);
}

export function isDriverFieldStatus(status: LoadStatus): boolean {
  return DRIVER_FIELD_STATUSES.has(status);
}

export function isFinalLoadStatus(status: LoadStatus): boolean {
  return FINAL_LOAD_STATUSES.has(status);
}

export function canDriverTransition(from: LoadStatus, to: LoadStatus): boolean {
  return getDriverActionsForStatus(from).includes(to);
}
