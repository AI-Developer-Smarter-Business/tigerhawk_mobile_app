import * as fs from 'node:fs';
import * as path from 'node:path';

import { buildDocumentUploadPath } from '@/lib/tms/document-upload-request';
import {
  MOBILE_AUTH_LOGIN_PATH,
  MOBILE_DRIVER_CLOCK_PATH,
  MOBILE_DRIVER_LOADS_PATH,
  MOBILE_DRIVER_LOAD_HISTORY_PATH,
  mobileLoadAcceptPath,
  mobileLoadDocumentsPath,
  mobileLoadPodPath,
  mobileLoadPodSignaturePath,
  mobileLoadProgressPath,
  mobileLoadRejectPath,
} from '@/lib/tms/mobile-api-routes';

describe('mobile-api-routes (A.0)', () => {
  it('exposes fixed auth / driver paths from RESPUESTAS', () => {
    expect(MOBILE_AUTH_LOGIN_PATH).toBe('/api/mobile/auth/login');
    expect(MOBILE_DRIVER_CLOCK_PATH).toBe('/api/mobile/driver/clock');
    expect(MOBILE_DRIVER_LOADS_PATH).toBe('/api/mobile/driver/loads');
    expect(MOBILE_DRIVER_LOAD_HISTORY_PATH).toBe(
      '/api/mobile/driver/loads/history',
    );
  });

  it('builds load-scoped paths with encodeURIComponent', () => {
    const id = 'load/with spaces';
    const encoded = encodeURIComponent(id);
    expect(mobileLoadProgressPath(id)).toBe(`/api/mobile/loads/${encoded}/progress`);
    expect(mobileLoadDocumentsPath(id)).toBe(`/api/mobile/loads/${encoded}/documents`);
    expect(mobileLoadPodPath(id)).toBe(`/api/mobile/loads/${encoded}/pod`);
    expect(mobileLoadPodSignaturePath(id)).toBe(
      `/api/mobile/loads/${encoded}/pod-signature`,
    );
    expect(mobileLoadAcceptPath(id)).toBe(`/api/mobile/loads/${encoded}/accept`);
    expect(mobileLoadRejectPath(id)).toBe(`/api/mobile/loads/${encoded}/reject`);
  });

  it('stays aligned with document upload helper', () => {
    expect(buildDocumentUploadPath('abc-123')).toBe(mobileLoadDocumentsPath('abc-123'));
  });

  it('keeps smoke script path literals in sync', () => {
    const smoke = fs.readFileSync(
      path.join(__dirname, '..', '..', '..', 'scripts', 'smoke-mobile-api-a0.mjs'),
      'utf8',
    );
    expect(smoke).toContain(MOBILE_AUTH_LOGIN_PATH);
    expect(smoke).toContain(MOBILE_DRIVER_CLOCK_PATH);
    expect(smoke).toContain(MOBILE_DRIVER_LOADS_PATH);
    expect(smoke).toContain(MOBILE_DRIVER_LOAD_HISTORY_PATH);
    expect(smoke).toContain('/progress');
    expect(smoke).toContain('/pod-signature');
    expect(smoke).toContain('/accept');
    expect(smoke).toContain('/reject');
    expect(smoke).toContain('/documents');
  });
});
