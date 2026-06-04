import { strings } from '@/constants/strings';
import { TmsDocumentUploadError } from '@/lib/tms/document-errors';
import { TMS_DOCUMENT_MAX_BYTES } from '@/lib/tms/document-upload-limits';

import { validateDriverUploadFile } from '../validate-driver-upload-file';

const validFile = {
  uri: 'file:///photo.jpg',
  name: 'photo.jpg',
  type: 'image/jpeg',
  size: 1024,
};

describe('validateDriverUploadFile', () => {
  it('accepts allowed image MIME within TMS size limits', () => {
    expect(() => validateDriverUploadFile(validFile)).not.toThrow();
    expect(() =>
      validateDriverUploadFile({ ...validFile, type: 'image/png' }),
    ).not.toThrow();
  });

  it('rejects missing or unsupported MIME with driver-facing copy', () => {
    expect(() => validateDriverUploadFile({ ...validFile, type: '' })).toThrow(
      TmsDocumentUploadError,
    );
    expect(() =>
      validateDriverUploadFile({ ...validFile, type: 'application/pdf' }),
    ).toThrow(strings.loadDetail.driverUploadInvalidMime);
  });

  it('rejects files over 50 MB with FILE_TOO_LARGE', () => {
    try {
      validateDriverUploadFile({ ...validFile, size: TMS_DOCUMENT_MAX_BYTES + 1 });
      throw new Error('expected TmsDocumentUploadError');
    } catch (err) {
      expect(err).toBeInstanceOf(TmsDocumentUploadError);
      const uploadErr = err as TmsDocumentUploadError;
      expect(uploadErr.message).toBe(strings.loadDetail.driverUploadFileTooLarge);
      expect(uploadErr.code).toBe('FILE_TOO_LARGE');
    }
  });

  it('rejects empty files', () => {
    try {
      validateDriverUploadFile({ ...validFile, size: 0 });
      throw new Error('expected TmsDocumentUploadError');
    } catch (err) {
      expect(err).toBeInstanceOf(TmsDocumentUploadError);
      expect((err as TmsDocumentUploadError).message).toBe(
        strings.loadDetail.driverUploadEmptyFile,
      );
    }
  });
});
