import { formatHoldLabel } from '@/lib/loads/active-holds';
import { TmsStatusChangeError } from '@/lib/tms/errors';
import { formatLoadStatus } from '@/lib/loads/format';
import type { LoadStatus } from '@/types';

import { errorStrings } from './strings';
import type { UserFacingError } from './types';

/** Maps TMS `PATCH …/status` errors to structured UI copy (aligned to TMS panel). */
export function mapStatusChangeError(error: TmsStatusChangeError): UserFacingError {
  switch (error.code) {
    case 'ACTIVE_HOLDS': {
      const details =
        error.activeHolds?.map((key) => formatHoldLabel(key)) ?? undefined;
      return {
        kind: 'active_holds',
        title: errorStrings.holdsTitle,
        message: error.message || errorStrings.holdsMessage,
        details: details?.length
          ? [...details, errorStrings.holdsContact]
          : [errorStrings.holdsContact],
      };
    }
    case 'FORBIDDEN':
      return {
        kind: 'permission',
        title: errorStrings.permissionTitle,
        message: error.message || errorStrings.permissionMessage,
      };
    case 'UNAUTHORIZED':
      return {
        kind: 'auth',
        title: errorStrings.authTitle,
        message: error.message || errorStrings.authMessage,
      };
    case 'NOT_FOUND':
      return {
        kind: 'not_found',
        title: errorStrings.notFoundTitle,
        message: error.message || errorStrings.notFoundMessage,
      };
    case 'INVALID_TRANSITION': {
      const details = error.validNextStates?.map((s) =>
        formatLoadStatus(s as LoadStatus),
      );
      return {
        kind: 'validation',
        title: errorStrings.validationTitle,
        message: error.message || errorStrings.validationTransition,
        details: details?.length
          ? [`${errorStrings.validationAllowedPrefix} ${details.join(', ')}`]
          : undefined,
      };
    }
    case 'CONFIG':
      return {
        kind: 'config',
        title: errorStrings.configTitle,
        message: error.message || errorStrings.configMessage,
      };
    case 'NETWORK':
      return {
        kind: 'network',
        title: errorStrings.networkTitle,
        message: error.message || errorStrings.networkMessage,
      };
    case 'BAD_REQUEST':
      return {
        kind: 'validation',
        title: errorStrings.validationTitle,
        message: error.message || errorStrings.genericMessage,
      };
    default:
      return {
        kind: 'generic',
        title: errorStrings.genericTitle,
        message: error.message || errorStrings.genericMessage,
      };
  }
}

/** Client-side preview when holds are visible before PATCH. */
export function mapActiveHoldsPreview(holdKeys: string[]): UserFacingError {
  return {
    kind: 'active_holds',
    title: errorStrings.holdsTitle,
    message: errorStrings.holdsMessage,
    details: [
      ...holdKeys.map((key) => formatHoldLabel(key)),
      errorStrings.holdsContact,
    ],
  };
}
