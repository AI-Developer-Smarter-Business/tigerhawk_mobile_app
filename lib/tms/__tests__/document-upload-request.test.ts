import { assertDriverUploadDocumentType } from '../assert-driver-document-type';
import { TmsDocumentUploadError } from '../document-errors';
import { TMS_DOCUMENT_MAX_BYTES, TMS_DOCUMENT_MAX_FILENAME_LENGTH } from '../document-upload-limits';
import {
  buildDocumentUploadFormData,
  buildDocumentUploadHeaders,
  buildDocumentUploadPath,
  buildDocumentUploadRequestInit,
  validateDocumentUploadFile,
} from '../document-upload-request';
import {
  captureFormDataAppends,
  getCapturedDocumentType,
  getCapturedFilePart,
} from '../testing/form-data-test-utils';

const sampleFile = {
  uri: 'file:///photo.jpg',
  name: 'photo.jpg',
  type: 'image/jpeg',
  size: 1024,
};

describe('buildDocumentUploadPath', () => {
  it('encodes load id in the path segment', () => {
    expect(buildDocumentUploadPath('load/with spaces')).toBe(
      '/api/dispatcher/loads/load%2Fwith%20spaces/documents',
    );
  });

  it('uses dispatcher loads documents route', () => {
    expect(buildDocumentUploadPath('abc-123')).toBe(
      '/api/dispatcher/loads/abc-123/documents',
    );
  });
});

describe('buildDocumentUploadHeaders', () => {
  it('sends bearer JWT without Content-Type (multipart boundary)', () => {
    expect(buildDocumentUploadHeaders('  my.jwt.token  ')).toEqual({
      Authorization: 'Bearer my.jwt.token',
      Accept: 'application/json',
    });
  });
});

describe('validateDocumentUploadFile', () => {
  it('accepts file within TMS limits', () => {
    expect(() => validateDocumentUploadFile(sampleFile)).not.toThrow();
  });

  it('rejects empty files', () => {
    expect(() =>
      validateDocumentUploadFile({ ...sampleFile, size: 0 }),
    ).toThrow(TmsDocumentUploadError);
  });

  it('rejects files over 50 MB', () => {
    expect(() =>
      validateDocumentUploadFile({ ...sampleFile, size: TMS_DOCUMENT_MAX_BYTES + 1 }),
    ).toThrow(/50MB/);
  });

  it('rejects long filenames', () => {
    expect(() =>
      validateDocumentUploadFile({
        ...sampleFile,
        name: 'a'.repeat(TMS_DOCUMENT_MAX_FILENAME_LENGTH + 1),
      }),
    ).toThrow(/Filename too long/);
  });
});

describe('assertDriverUploadDocumentType', () => {
  it('allows POD and Photo', () => {
    expect(() => assertDriverUploadDocumentType('POD')).not.toThrow();
    expect(() => assertDriverUploadDocumentType('Photo')).not.toThrow();
  });

  it('rejects staff-only types before network', () => {
    expect(() => assertDriverUploadDocumentType('Invoice')).toThrow(
      /POD or Photo/,
    );
  });
});

describe('buildDocumentUploadFormData', () => {
  it('appends React Native file part and document_type metadata', () => {
    const { entries } = captureFormDataAppends(() =>
      buildDocumentUploadFormData({ file: sampleFile, documentType: 'POD' }),
    );

    expect(entries).toHaveLength(2);
    expect(getCapturedFilePart(entries)).toEqual({
      uri: 'file:///photo.jpg',
      name: 'photo.jpg',
      type: 'image/jpeg',
    });
    expect(getCapturedDocumentType(entries)).toBe('POD');
  });

  it('supports Photo document type metadata', () => {
    const { entries } = captureFormDataAppends(() =>
      buildDocumentUploadFormData({ file: sampleFile, documentType: 'Photo' }),
    );

    expect(getCapturedDocumentType(entries)).toBe('Photo');
  });

  it('defaults file MIME to application/octet-stream when type is empty', () => {
    const { entries } = captureFormDataAppends(() =>
      buildDocumentUploadFormData({
        file: { ...sampleFile, type: '' },
        documentType: 'POD',
      }),
    );

    expect(getCapturedFilePart(entries)?.type).toBe('application/octet-stream');
  });

  it('does not append when validation fails', () => {
    expect(() =>
      captureFormDataAppends(() =>
        buildDocumentUploadFormData({
          file: { ...sampleFile, size: 0 },
          documentType: 'POD',
        }),
      ),
    ).toThrow(TmsDocumentUploadError);
  });
});

describe('buildDocumentUploadRequestInit', () => {
  it('builds POST multipart init aligned to uploadLoadDocument', () => {
    const init = buildDocumentUploadRequestInit('jwt', {
      file: sampleFile,
      documentType: 'POD',
    });
    expect(init.method).toBe('POST');
    expect(init.headers).toEqual({
      Authorization: 'Bearer jwt',
      Accept: 'application/json',
    });
    expect(init.body).toBeInstanceOf(FormData);
  });

  it('wires bearer headers and FormData metadata for fetch', () => {
    const { entries } = captureFormDataAppends(() => {
      const init = buildDocumentUploadRequestInit('driver-jwt', {
        file: sampleFile,
        documentType: 'POD',
      });
      return init.body;
    });

    expect(getCapturedFilePart(entries)?.uri).toBe(sampleFile.uri);
    expect(getCapturedDocumentType(entries)).toBe('POD');
  });
});
