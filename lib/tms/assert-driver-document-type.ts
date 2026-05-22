import { TmsDocumentUploadError } from './document-errors';

/** Field uploads only — matches recommended TMS patch (`TMS_PATCH_4_1_DRIVER_DOCUMENTS.md`). */
export const DRIVER_UPLOAD_DOCUMENT_TYPES = ['POD', 'Photo'] as const;

export type DriverUploadDocumentType = (typeof DRIVER_UPLOAD_DOCUMENT_TYPES)[number];

export function isDriverUploadDocumentType(
  value: string,
): value is DriverUploadDocumentType {
  return (DRIVER_UPLOAD_DOCUMENT_TYPES as readonly string[]).includes(value);
}

/** Rejects document types outside the driver field subset before calling TMS POST. */
export function assertDriverUploadDocumentType(documentType: string): void {
  if (!isDriverUploadDocumentType(documentType)) {
    throw new TmsDocumentUploadError(
      'Drivers may only upload POD or Photo documents.',
      'DOCUMENT_TYPE_FORBIDDEN',
    );
  }
}
