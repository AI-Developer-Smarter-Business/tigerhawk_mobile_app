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

  if (httpStatus === 401) {
    return new TmsDocumentUploadError(
      error ?? 'Session expired. Sign in again.',
      'UNAUTHORIZED',
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
