import type { LoadStatus } from '@/types';

import { DRIVER_FIELD_STATUSES, MOCK_LOAD_TRANSITIONS } from './constants';

/** Acciones de campo visibles para el conductor (sin botones de despacho). */
export function getDriverActionsForStatus(status: LoadStatus): LoadStatus[] {
  const next = MOCK_LOAD_TRANSITIONS[status] ?? [];
  return next.filter((s) => DRIVER_FIELD_STATUSES.has(s) || s === 'Completed');
}

export function canDriverTransition(from: LoadStatus, to: LoadStatus): boolean {
  return getDriverActionsForStatus(from).includes(to);
}
