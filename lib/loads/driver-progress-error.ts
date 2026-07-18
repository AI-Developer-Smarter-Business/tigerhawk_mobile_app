import { mapErrorToUserFacing } from '@/lib/errors/map-api-error';
import type { UserFacingError } from '@/lib/errors/types';
import type { MobileApiAppAction } from '@/lib/tms/mobile-api-error-codes';
import { TmsMobileApiError } from '@/lib/tms/mobile-api-error';

export type DriverProgressError = UserFacingError & {
  code: TmsMobileApiError['code'];
  appAction: MobileApiAppAction | 'generic';
};

/**
 * Keeps structured mobile error metadata for D.6 UI.
 * Resolution screens for chassis and legal POD consume `appAction` in E.1/G.4.
 */
export function mapDriverProgressError(error: unknown): DriverProgressError {
  const userFacing = mapErrorToUserFacing(error);

  if (error instanceof TmsMobileApiError) {
    return {
      ...userFacing,
      code: error.code,
      appAction: error.appAction,
    };
  }

  return {
    ...userFacing,
    code: 'UNKNOWN',
    appAction: 'generic',
  };
}
