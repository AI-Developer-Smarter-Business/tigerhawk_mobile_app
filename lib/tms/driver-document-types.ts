import type { DriverUploadDocumentType } from './assert-driver-document-type';

/** Driver-selectable types (TMS `DRIVER_UPLOAD_DOCUMENT_TYPES` + DocumentsTab labels). */
export type DriverDocumentTypeOption = {
  value: DriverUploadDocumentType;
  labelKey: 'documentTypeDriver' | 'documentTypePod' | 'documentTypePhoto';
  hintKey: 'documentTypeDriverHint' | 'documentTypePodHint' | 'documentTypePhotoHint';
};

export const DRIVER_DOCUMENT_TYPE_OPTIONS: readonly DriverDocumentTypeOption[] = [
  {
    value: 'Driver',
    labelKey: 'documentTypeDriver',
    hintKey: 'documentTypeDriverHint',
  },
  {
    value: 'POD',
    labelKey: 'documentTypePod',
    hintKey: 'documentTypePodHint',
  },
  {
    value: 'Photo',
    labelKey: 'documentTypePhoto',
    hintKey: 'documentTypePhotoHint',
  },
] as const;

export const DEFAULT_DRIVER_DOCUMENT_TYPE: DriverUploadDocumentType = 'Driver';
