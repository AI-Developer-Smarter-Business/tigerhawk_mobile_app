import { TmsDocumentUploadError } from './document-errors';

/** Mobile driver field uploads — stored in TMS as document type "Driver". */
export const DRIVER_UPLOAD_DOCUMENT_TYPES = ['Driver'] as const;

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
      'Drivers may only upload Driver-type documents.',
      'DOCUMENT_TYPE_FORBIDDEN',
    );
  }
}

export function isDriverUploadedDocument(doc: { document_type?: string | null }): boolean {
  return doc.document_type === 'Driver';
}
