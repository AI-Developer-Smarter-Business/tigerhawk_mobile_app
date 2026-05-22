import { parseDocumentUploadError } from '../parse-document-error';

describe('parseDocumentUploadError', () => {
  it('maps 403 driver document type forbidden', () => {
    const err = parseDocumentUploadError(403, {
      error: 'Drivers may only upload POD or Photo documents.',
      code: 'DRIVER_DOCUMENT_TYPE_FORBIDDEN',
    });
    expect(err.code).toBe('DOCUMENT_TYPE_FORBIDDEN');
  });

  it('maps 403 assignment permission', () => {
    const err = parseDocumentUploadError(403, {
      error: "You don't have permission to upload documents for this load",
    });
    expect(err.code).toBe('FORBIDDEN');
  });

  it('maps 400 file size to FILE_TOO_LARGE', () => {
    const err = parseDocumentUploadError(400, { error: 'File exceeds 50MB limit' });
    expect(err.code).toBe('FILE_TOO_LARGE');
  });

  it('maps 401 to UNAUTHORIZED', () => {
    const err = parseDocumentUploadError(401, { error: 'Unauthorized' });
    expect(err.code).toBe('UNAUTHORIZED');
  });
});
