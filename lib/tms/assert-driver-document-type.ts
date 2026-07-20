import { TmsDocumentUploadError } from './document-errors';

/**
 * Mobile driver field uploads — aligned to TMS `DRIVER_UPLOAD_DOCUMENT_TYPES`
 * (`TMS_fusion` process-load-document-upload). Exact strings for TIR (F.4).
 */
export const DRIVER_UPLOAD_DOCUMENT_TYPES = [
  'Driver',
  'POD',
  'Photo',
  'TIR Out',
  'TIR In',
] as const;

export type DriverUploadDocumentType =
  (typeof DRIVER_UPLOAD_DOCUMENT_TYPES)[number];

export function isDriverUploadDocumentType(
  value: string,
): value is DriverUploadDocumentType {
  return (DRIVER_UPLOAD_DOCUMENT_TYPES as readonly string[]).includes(value);
}

/** Rejects document types outside the driver field subset before calling TMS POST. */
export function assertDriverUploadDocumentType(documentType: string): void {
  if (!isDriverUploadDocumentType(documentType)) {
    throw new TmsDocumentUploadError(
      'Drivers may only upload Driver, Photo, TIR Out, or TIR In documents.',
      'DOCUMENT_TYPE_FORBIDDEN',
    );
  }
}

/**
 * F.5 / TMS normalize: photo labeled POD is Driver evidence — not legal POD.
 * TIR types must stay exact so Complete can clear `tir_*_photo`.
 */
export function normalizeDriverUploadDocumentType(
  documentType: DriverUploadDocumentType,
): DriverUploadDocumentType {
  if (documentType === 'POD') return 'Driver';
  return documentType;
}

/** Mobile-origin evidence rows (Driver + optional Photo stored as Driver on TMS). */
export function isDriverUploadedDocument(doc: {
  document_type?: string | null;
}): boolean {
  const type = doc.document_type;
  return type === 'Driver' || type === 'Photo';
}

export function isTirDocumentType(
  value: string | null | undefined,
): value is 'TIR Out' | 'TIR In' {
  return value === 'TIR Out' || value === 'TIR In';
}
