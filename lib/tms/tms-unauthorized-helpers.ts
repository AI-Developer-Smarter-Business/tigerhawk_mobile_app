import { TmsDocumentUploadError } from './document-errors';
import { TmsStatusChangeError } from './errors';

function tmsRejectedJwtMessage(): TmsDocumentUploadError {
  return new TmsDocumentUploadError(
    'TMS did not accept your session. The server must forward Authorization Bearer from the mobile app (see docs/TMS_PATCH_MOBILE_BEARER_AUTH.md).',
    'UNAUTHORIZED',
  );
}

/**
 * After a fresh access token was obtained, TMS 401 usually means the server ignored Bearer
 * (cookies-only `createClient()`). See `docs/TMS_PATCH_MOBILE_BEARER_AUTH.md`.
 */
export function rethrowIfTmsApiUnauthorized(err: unknown): never {
  if (
    err instanceof TmsDocumentUploadError &&
    err.code === 'UNAUTHORIZED' &&
    !err.message.includes('Sign in again')
  ) {
    throw tmsRejectedJwtMessage();
  }
  if (err instanceof TmsStatusChangeError && err.code === 'UNAUTHORIZED') {
    throw new TmsStatusChangeError(tmsRejectedJwtMessage().message, 'UNAUTHORIZED');
  }
  throw err;
}
