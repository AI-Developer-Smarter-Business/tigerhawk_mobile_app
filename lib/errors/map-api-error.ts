import { OfflineError } from '@/lib/network/offline-error';
import { isNetworkFailure } from '@/lib/network/network-state';
import { LocationError } from '@/lib/location/location-errors';
import { TmsDocumentUploadError } from '@/lib/tms/document-errors';
import { TmsStatusChangeError } from '@/lib/tms/errors';

import { errorStrings } from './strings';
import { mapDocumentUploadError } from './map-document-error';
import { mapLocationError } from './map-location-error';
import { mapSupabaseError } from './map-supabase-error';
import { mapStatusChangeError } from './map-status-error';
import type { UserFacingError } from './types';

/**
 * Single entry point: PostgREST, TMS status PATCH, document POST, or unknown errors.
 */
function mapNetworkError(error: unknown): UserFacingError {
  const message =
    error instanceof OfflineError
      ? error.message
      : error instanceof Error && error.message
        ? error.message
        : errorStrings.networkMessage;
  return {
    kind: 'network',
    title: errorStrings.networkTitle,
    message,
  };
}

export function mapErrorToUserFacing(error: unknown): UserFacingError {
  if (error instanceof OfflineError) {
    return mapNetworkError(error);
  }
  if (isNetworkFailure(error)) {
    return mapNetworkError(error);
  }
  if (error instanceof TmsDocumentUploadError) {
    return mapDocumentUploadError(error);
  }
  if (error instanceof LocationError) {
    return mapLocationError(error);
  }
  if (error instanceof TmsStatusChangeError) {
    return mapStatusChangeError(error);
  }
  if (error instanceof Error && error.message) {
    return mapSupabaseError(error);
  }
  if (typeof error === 'string' && error.trim()) {
    return mapSupabaseError(error);
  }
  return mapSupabaseError(null);
}

/** Flat message for simple banners (list/detail). */
export function getUserFacingMessage(error: unknown): string {
  const mapped = mapErrorToUserFacing(error);
  if (mapped.details?.length) {
    return `${mapped.message}\n${mapped.details.join('\n')}`;
  }
  return mapped.message;
}
