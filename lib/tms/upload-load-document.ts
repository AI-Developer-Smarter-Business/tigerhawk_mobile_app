import type { DriverUploadDocumentType } from './assert-driver-document-type';
import { assertDriverUploadDocumentType } from './assert-driver-document-type';
import { assertTmsUrlReachableFromDevice } from './assert-tms-device-url';
import { tmsDocumentApiPath } from './client';
import { TmsDocumentUploadError } from './document-errors';
import {
    buildDocumentUploadPath,
    buildDocumentUploadRequestInit,
    type TmsUploadFileDescriptor,
} from './document-upload-request';
import { parseDocumentUploadError } from './parse-document-error';

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
    response = await fetch(url, init);
  } catch {
    throw new TmsDocumentUploadError(
      'Network error. Check your connection and try again.',
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

  return body as LoadDocumentRecord;
}
