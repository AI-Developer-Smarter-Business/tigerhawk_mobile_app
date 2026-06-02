import { assertUploadResponseMatchesLoad } from '@/lib/loads/document-load-association';
import { safeLog } from '@/lib/logging/safe-log';

import type { DriverUploadDocumentType } from './assert-driver-document-type';
import { assertDriverUploadDocumentType } from './assert-driver-document-type';
import { assertTmsUrlReachableFromDevice } from './assert-tms-device-url';
import { getTmsApiUrl, tmsDocumentApiPath } from './client';
import { TmsDocumentUploadError } from './document-errors';
import {
    buildDocumentUploadPath,
    buildDocumentUploadRequestInit,
    type TmsUploadFileDescriptor,
} from './document-upload-request';
import { parseDocumentUploadError } from './parse-document-error';

const DEV_FETCH_ATTEMPTS = 3;
const DEV_FETCH_RETRY_MS = 2500;

async function fetchTmsUpload(
  url: string,
  init: RequestInit,
): Promise<Response> {
  const attempts =
    typeof __DEV__ !== 'undefined' && __DEV__ ? DEV_FETCH_ATTEMPTS : 1;

  let lastError: unknown;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      return await fetch(url, init);
    } catch (err) {
      lastError = err;
      safeLog.warn('upload-load-document', `fetch attempt ${attempt}/${attempts} failed`, {
        host: (() => {
          try {
            return new URL(url).host;
          } catch {
            return 'unknown';
          }
        })(),
        cause: err instanceof Error ? err.message : String(err),
      });
      if (attempt < attempts) {
        await new Promise((resolve) => setTimeout(resolve, DEV_FETCH_RETRY_MS));
      }
    }
  }
  throw lastError;
}

export type UploadLoadDocumentParams = {
  loadId: string;
  file: TmsUploadFileDescriptor;
  documentType: DriverUploadDocumentType;
  accessToken: string;
  /** When true (default), reject non–POD/Photo types before calling TMS. */
  enforceDriverDocumentTypeOnly?: boolean;
};

export type LoadDocumentRecord = {
  id: string;
  load_id: string;
  filename: string;
  url: string;
  storage_path?: string | null;
  document_type: string;
  file_size?: number | null;
  uploaded_by?: string | null;
  uploaded_at?: string | null;
};

/**
 * Uploads a load document via the TMS BFF.
 * Contract: `POST /api/dispatcher/loads/[id]/documents` (multipart).
 * Requires TMS patch 4.1 deployed for driver role.
 * @see docs/TMS_PATCH_4_1_DRIVER_DOCUMENTS.md
 */
export async function uploadLoadDocument(
  params: UploadLoadDocumentParams,
): Promise<LoadDocumentRecord> {
  const {
    loadId,
    file,
    documentType,
    accessToken,
    enforceDriverDocumentTypeOnly = true,
  } = params;

  if (enforceDriverDocumentTypeOnly) {
    assertDriverUploadDocumentType(documentType);
  }

  assertTmsUrlReachableFromDevice();

  const url = tmsDocumentApiPath(buildDocumentUploadPath(loadId));
  const init = buildDocumentUploadRequestInit(accessToken, {
    file,
    documentType,
  });

  let response: Response;
  try {
    response = await fetchTmsUpload(url, init);
  } catch (err) {
    const base = getTmsApiUrl();
    safeLog.error('upload-load-document', 'TMS document upload fetch failed', {
      host: (() => {
        try {
          return new URL(url).host;
        } catch {
          return 'unknown';
        }
      })(),
      cause: err instanceof Error ? err.message : String(err),
    });
    const devHint =
      typeof __DEV__ !== 'undefined' &&
      __DEV__ &&
      base
        ? ` Could not reach ${base}. Is TMS running (npm run dev)? Open that URL once in the phone browser (first API compile can take ~30s), same Wi‑Fi, and allow port 3000 in Windows Firewall.`
        : '';
    throw new TmsDocumentUploadError(
      `Network error. Check your connection and try again.${devHint}`,
      'NETWORK',
    );
  }

  const raw = await response.text();
  let body: unknown = null;
  if (raw) {
    try {
      body = JSON.parse(raw) as unknown;
    } catch {
      body = null;
    }
  }

  if (!response.ok) {
    throw parseDocumentUploadError(response.status, body);
  }

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new TmsDocumentUploadError(
      'Invalid response from document upload.',
      'UNKNOWN',
    );
  }

  const record = body as LoadDocumentRecord;
  assertUploadResponseMatchesLoad(record, loadId);
  return record;
}
