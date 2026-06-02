import { TmsDocumentUploadError } from './document-errors';
import { TmsStatusChangeError } from './errors';

function tmsRejectedJwtMessage(): TmsDocumentUploadError {
  return new TmsDocumentUploadError(
    'TMS upload was rejected (401). The app uses Supabase direct upload first; if that failed, deploy /api/mobile on your TMS or set EXPO_PUBLIC_TMS_API_URL to a patched host. See docs/TMS_PATCH_MOBILE_BEARER_AUTH.md.',
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
    (err.message.includes('MOBILE_JWT') ||
      err.message.includes('MISSING_TOKEN') ||
      err.message.includes('same project') ||
      err.message.includes('misconfigured'))
  ) {
    throw err;
  }
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
