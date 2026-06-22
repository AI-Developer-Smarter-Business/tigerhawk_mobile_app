import { canDriverTransition, isDriverFieldStatus } from './driver-actions';
import { MOCK_LOAD_TRANSITIONS } from './constants';
import type { LoadTransitionMap } from '@/lib/tms/fetch-load-transitions';
import type { LoadStatus } from '@/types';

/**
 * Optimistic cache updates are only safe when the UI and server are likely to agree:
 * valid driver-field transition, no active holds, and a field (non-final) target status.
 * Otherwise we PATCH first and refetch — no speculative cache write.
 */
export function canOptimisticallyUpdateLoadStatus(params: {
  from: LoadStatus;
  to: LoadStatus;
  activeHolds: string[];
  transitionMap?: LoadTransitionMap;
}): boolean {
  const { from, to, activeHolds, transitionMap = MOCK_LOAD_TRANSITIONS } = params;
  if (activeHolds.length > 0) return false;
  if (!canDriverTransition(from, to, transitionMap)) return false;
  if (!isDriverFieldStatus(to)) return false;
  return true;
}
