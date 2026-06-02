import { TmsDocumentUploadError } from '../document-errors';
import { TmsStatusChangeError } from '../errors';
import { rethrowIfTmsApiUnauthorized } from '../tms-unauthorized-helpers';

describe('rethrowIfTmsApiUnauthorized', () => {
  it('replaces generic TMS 401 with mobile TMS patch hint', () => {
    expect(() =>
      rethrowIfTmsApiUnauthorized(
        new TmsDocumentUploadError('Unauthorized', 'UNAUTHORIZED'),
      ),
    ).toThrow(/TMS upload was rejected|TMS_PATCH_MOBILE_BEARER_AUTH/);
  });

  it('rethrows status 401 as mobile TMS patch hint', () => {
    expect(() =>
      rethrowIfTmsApiUnauthorized(
        new TmsStatusChangeError('Unauthorized', 'UNAUTHORIZED'),
      ),
    ).toThrow(/TMS upload was rejected|TMS_PATCH_MOBILE_BEARER_AUTH/);
  });

  it('preserves session expired from client', () => {
    expect(() =>
      rethrowIfTmsApiUnauthorized(
        new TmsDocumentUploadError('Session expired. Sign in again.', 'UNAUTHORIZED'),
      ),
    ).toThrow('Session expired. Sign in again.');
  });
});
