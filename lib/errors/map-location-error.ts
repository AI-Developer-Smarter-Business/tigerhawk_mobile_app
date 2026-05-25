import { strings } from '@/constants/strings';
import { LocationError } from '@/lib/location/location-errors';

import type { UserFacingError } from './types';

export function mapLocationError(error: unknown): UserFacingError {
  if (error instanceof LocationError) {
    switch (error.code) {
      case 'PERMISSION_DENIED':
        return {
          kind: 'permission',
          title: strings.location.permissionDeniedTitle,
          message: strings.location.permissionDeniedMessage,
        };
      case 'SERVICES_DISABLED':
        return {
          kind: 'validation',
          title: strings.location.permissionDeniedTitle,
          message: strings.location.servicesDisabledMessage,
        };
      case 'POSITION_UNAVAILABLE':
      case 'POLICY_VIOLATION':
        return {
          kind: 'generic',
          title: strings.location.permissionDeniedTitle,
          message: error.message,
        };
    }
  }

  return {
    kind: 'generic',
    title: strings.location.permissionDeniedTitle,
    message: strings.location.shareFailed,
  };
}
