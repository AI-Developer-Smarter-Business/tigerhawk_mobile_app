import { TmsDocumentUploadError } from '../document-errors';
import { TmsStatusChangeError } from '../errors';
import { rethrowIfTmsApiUnauthorized } from '../tms-unauthorized-helpers';

describe('rethrowIfTmsApiUnauthorized', () => {
  it('replaces generic TMS 401 with Bearer patch hint', () => {
    expect(() =>
      rethrowIfTmsApiUnauthorized(
        new TmsDocumentUploadError('Unauthorized', 'UNAUTHORIZED'),
      ),
    ).toThrow(/Bearer/);
  });

  it('rethrows status 401 as Bearer hint', () => {
    expect(() =>
      rethrowIfTmsApiUnauthorized(
        new TmsStatusChangeError('Unauthorized', 'UNAUTHORIZED'),
      ),
    ).toThrow(/Bearer/);
  });

  it('preserves session expired from client', () => {
    expect(() =>
      rethrowIfTmsApiUnauthorized(
        new TmsDocumentUploadError('Session expired. Sign in again.', 'UNAUTHORIZED'),
      ),
    ).toThrow('Session expired. Sign in again.');
  });
});
