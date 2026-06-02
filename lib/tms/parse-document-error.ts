import { TmsDocumentUploadError } from './document-errors';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Maps TMS document POST HTTP status + JSON body to a typed client error. */
export function parseDocumentUploadError(
  httpStatus: number,
  body: unknown,
): TmsDocumentUploadError {
  const data = isRecord(body) ? body : {};
  const error = typeof data.error === 'string' ? data.error : undefined;
  const code = typeof data.code === 'string' ? data.code : undefined;
  const detail = typeof data.detail === 'string' ? data.detail : undefined;
  const hint = typeof data.hint === 'string' ? data.hint : undefined;

  if (httpStatus === 503) {
    return new TmsDocumentUploadError(
      error ?? 'TMS server is missing Supabase service role configuration.',
      'CONFIG',
    );
  }

  if (httpStatus === 401) {
    if (code === 'MISSING_TOKEN') {
      return new TmsDocumentUploadError(
        error ?? 'Upload missing session token. Restart the app and try again.',
        'UNAUTHORIZED',
      );
    }
    if (code === 'MOBILE_JWT_INVALID') {
      const parts = [error, detail, hint].filter(Boolean);
      return new TmsDocumentUploadError(
        parts.join(' ') || 'Session invalid for TMS upload.',
        'UNAUTHORIZED',
      );
    }
    return new TmsDocumentUploadError(
      error ?? 'Session expired. Sign in again.',
      'UNAUTHORIZED',
    );
  }

  if (httpStatus === 403 && code === 'NOT_ASSIGNED') {
    return new TmsDocumentUploadError(
      error ?? 'You are not assigned to this load.',
      'FORBIDDEN',
    );
  }

  if (httpStatus === 403 && code === 'PROFILE_NOT_FOUND') {
    return new TmsDocumentUploadError(
      error ?? 'Driver profile missing in TMS. Ask dispatch to set user_profiles.role = driver.',
      'FORBIDDEN',
    );
  }

  if (httpStatus === 400 && code === 'MISSING_FILE') {
    return new TmsDocumentUploadError(
      error ?? 'Photo file was not received by TMS. Try again or update the app.',
      'BAD_REQUEST',
    );
  }

  if (httpStatus === 403 && code === 'DRIVER_DOCUMENT_TYPE_FORBIDDEN') {
    return new TmsDocumentUploadError(
      error ?? 'Drivers may only upload POD or Photo documents.',
      'DOCUMENT_TYPE_FORBIDDEN',
    );
  }

  if (httpStatus === 403) {
    return new TmsDocumentUploadError(
      error ?? "You don't have permission to upload documents for this load.",
      'FORBIDDEN',
    );
  }

  if (httpStatus === 404) {
    return new TmsDocumentUploadError(error ?? 'Load not found.', 'NOT_FOUND');
  }

  if (httpStatus === 400) {
    const message = error ?? 'Upload could not be processed.';
    if (message.toLowerCase().includes('50mb')) {
      return new TmsDocumentUploadError(message, 'FILE_TOO_LARGE');
    }
    if (message.toLowerCase().includes('filename')) {
      return new TmsDocumentUploadError(message, 'FILENAME_TOO_LONG');
    }
    return new TmsDocumentUploadError(message, 'BAD_REQUEST');
  }

  if (httpStatus >= 400 && httpStatus < 500) {
    return new TmsDocumentUploadError(
      error ?? 'Request could not be processed.',
      'BAD_REQUEST',
    );
  }

  return new TmsDocumentUploadError(error ?? 'Failed to upload document.', 'UNKNOWN');
}
