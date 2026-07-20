import type { DriverUploadDocumentType } from './assert-driver-document-type';

/**
 * Optional driver evidence chips only (F.5).
 * Legal POD = Sign on device; TIR Out/In = PortPro document rows (F.1 / F.2).
 * POD is not selectable — photos labeled POD are remapped to Driver.
 */
export type DriverDocumentTypeOption = {
  value: Extract<DriverUploadDocumentType, 'Driver' | 'Photo'>;
  labelKey: 'documentTypeDriver' | 'documentTypePhoto';
  hintKey: 'documentTypeDriverHint' | 'documentTypePhotoHint';
};

export const DRIVER_DOCUMENT_TYPE_OPTIONS: readonly DriverDocumentTypeOption[] =
  [
    {
      value: 'Driver',
      labelKey: 'documentTypeDriver',
      hintKey: 'documentTypeDriverHint',
    },
    {
      value: 'Photo',
      labelKey: 'documentTypePhoto',
      hintKey: 'documentTypePhotoHint',
    },
  ] as const;

export const DEFAULT_DRIVER_DOCUMENT_TYPE: DriverUploadDocumentType = 'Driver';

export const TIR_OUT_DOCUMENT_TYPE = 'TIR Out' as const;
export const TIR_IN_DOCUMENT_TYPE = 'TIR In' as const;
