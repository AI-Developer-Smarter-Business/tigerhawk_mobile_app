import {
  TMS_DOCUMENT_MAX_BYTES,
  TMS_DOCUMENT_MAX_FILENAME_LENGTH,
} from './document-upload-limits';
import { TmsDocumentUploadError } from './document-errors';
import type { DriverUploadDocumentType } from './assert-driver-document-type';

/** File descriptor for React Native `FormData` append (task 4.2 wires `expo-image-picker`). */
export type TmsUploadFileDescriptor = {
  uri: string;
  name: string;
  type: string;
  size: number;
};

/**
 * Mobile BFF — dedicated route (no TMS cookie middleware).
 * Multipart fields (same names as dispatcher DocumentsTab):
 * `file`, `document_type`, plus `access_token` for JWT.
 */
export function buildDocumentUploadPath(loadId: string): string {
  return `/api/mobile/loads/${encodeURIComponent(loadId)}/documents`;
}

/** Bearer only — do not set `Content-Type`; fetch sets multipart boundary. */
export function buildDocumentUploadHeaders(accessToken: string): Record<string, string> {
  const token = accessToken.trim();
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/json',
  };
}

export function validateDocumentUploadFile(file: TmsUploadFileDescriptor): void {
  if (!file.name?.trim()) {
    throw new TmsDocumentUploadError('File name is required.', 'BAD_REQUEST');
  }
  if (file.name.length > TMS_DOCUMENT_MAX_FILENAME_LENGTH) {
    throw new TmsDocumentUploadError(
      `Filename too long (max ${TMS_DOCUMENT_MAX_FILENAME_LENGTH} characters).`,
      'FILENAME_TOO_LONG',
    );
  }
  if (file.size > TMS_DOCUMENT_MAX_BYTES) {
    throw new TmsDocumentUploadError('File exceeds 50MB limit.', 'FILE_TOO_LARGE');
  }
  if (file.size <= 0) {
    throw new TmsDocumentUploadError('File is empty.', 'BAD_REQUEST');
  }
}

export type BuildDocumentFormDataParams = {
  file: TmsUploadFileDescriptor;
  documentType: DriverUploadDocumentType;
};

/** Builds multipart body for TMS POST (React Native FormData shape). */
export function buildDocumentUploadFormData(params: BuildDocumentFormDataParams): FormData {
  validateDocumentUploadFile(params.file);
  const formData = new FormData();
  formData.append('file', {
    uri: params.file.uri,
    name: params.file.name,
    type: params.file.type || 'application/octet-stream',
  } as unknown as Blob);
  formData.append('document_type', params.documentType);
  formData.append('filename', params.file.name);
  return formData;
}

/** Multipart body including JWT fallback when proxies strip Authorization. */
export function buildDocumentUploadFormDataWithAuth(
  accessToken: string,
  params: BuildDocumentFormDataParams,
): FormData {
  const formData = buildDocumentUploadFormData(params);
  formData.append('access_token', accessToken.trim());
  return formData;
}

export type DocumentUploadRequestInit = {
  method: 'POST';
  headers: Record<string, string>;
  body: FormData;
};

export function buildDocumentUploadRequestInit(
  accessToken: string,
  params: BuildDocumentFormDataParams,
): DocumentUploadRequestInit {
  return {
    method: 'POST',
    headers: buildDocumentUploadHeaders(accessToken),
    body: buildDocumentUploadFormDataWithAuth(accessToken, params),
  };
}
