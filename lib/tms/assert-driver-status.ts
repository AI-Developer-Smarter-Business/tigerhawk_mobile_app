import { DRIVER_FIELD_STATUSES } from '@/lib/loads/constants';
import type { LoadStatus } from '@/types';

import { TmsStatusChangeError } from './errors';

/**
 * Client guard (task 3.3): drivers may only PATCH field statuses.
 * Server must enforce the same in TMS `status/route.ts` — see docs/TMS_PATCH_3_3_DRIVER_STATUS.md.
 */
export function assertDriverFieldStatusTarget(status: LoadStatus): void {
  if (!DRIVER_FIELD_STATUSES.has(status)) {
    throw new TmsStatusChangeError(
      'This status change is not allowed for drivers.',
      'FORBIDDEN',
    );
  }
}
