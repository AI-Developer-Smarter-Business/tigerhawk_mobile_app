jest.mock('@/lib/config/env', () => ({
  env: { tmsApiUrl: '' },
}));

import { requireTmsApiUrl, tmsApiPath, tmsDocumentApiPath } from '../client';
import { TmsDocumentUploadError } from '../document-errors';
import { TmsStatusChangeError } from '../errors';

describe('requireTmsApiUrl', () => {
  it('throws CONFIG when TMS URL is empty', () => {
    let caught: unknown;
    try {
      requireTmsApiUrl();
    } catch (error) {
      caught = error;
    }
    expect(caught).toBeInstanceOf(TmsStatusChangeError);
    expect((caught as TmsStatusChangeError).code).toBe('CONFIG');
    expect((caught as TmsStatusChangeError).message).toMatch(
      /EXPO_PUBLIC_TMS_API_URL/,
    );
  });
});

describe('tmsApiPath', () => {
  it('throws CONFIG when base URL is missing', () => {
    expect(() => tmsApiPath('/api/dispatcher/loads/x/status')).toThrow(
      TmsStatusChangeError,
    );
  });
});

describe('tmsDocumentApiPath', () => {
  it('throws TmsDocumentUploadError CONFIG when base URL is missing', () => {
    expect(() => tmsDocumentApiPath('/api/dispatcher/loads/x/documents')).toThrow(
      TmsDocumentUploadError,
    );
  });
});
