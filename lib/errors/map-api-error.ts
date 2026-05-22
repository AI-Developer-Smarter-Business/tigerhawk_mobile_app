import { TmsDocumentUploadError } from '@/lib/tms/document-errors';
import { TmsStatusChangeError } from '@/lib/tms/errors';

import { mapDocumentUploadError } from './map-document-error';
import { mapSupabaseError } from './map-supabase-error';
import { mapStatusChangeError } from './map-status-error';
import type { UserFacingError } from './types';

/**
 * Single entry point: PostgREST, TMS status PATCH, document POST, or unknown errors.
 */
export function mapErrorToUserFacing(error: unknown): UserFacingError {
  if (error instanceof TmsDocumentUploadError) {
    return mapDocumentUploadError(error);
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
