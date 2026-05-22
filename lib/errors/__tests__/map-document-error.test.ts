import { TmsDocumentUploadError } from '@/lib/tms/document-errors';

import { mapDocumentUploadError } from '../map-document-error';
import { mapErrorToUserFacing } from '../map-api-error';

describe('mapDocumentUploadError', () => {
  it('maps file too large to validation', () => {
    const result = mapDocumentUploadError(
      new TmsDocumentUploadError('File exceeds 50MB limit.', 'FILE_TOO_LARGE'),
    );
    expect(result.kind).toBe('validation');
  });
});

describe('mapErrorToUserFacing document branch', () => {
  it('routes TmsDocumentUploadError through document mapper', () => {
    const result = mapErrorToUserFacing(
      new TmsDocumentUploadError('Session expired. Sign in again.', 'UNAUTHORIZED'),
    );
    expect(result.kind).toBe('auth');
  });
});
