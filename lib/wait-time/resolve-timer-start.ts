import { DELIVERY_WAIT_START_STATUS } from './constants';
import type { LoadDetail } from '@/types';

/** When API event missing, use TMS timestamp from status change. */
export function resolveFallbackWaitStartIso(load: LoadDetail | null): string | null {
  if (!load || load.status !== DELIVERY_WAIT_START_STATUS) return null;
  return load.actual_delivery ?? null;
}
