import { strings } from '@/constants/strings';
import { TmsDocumentUploadError } from '@/lib/tms/document-errors';
import {
  validateDocumentUploadFile,
  type TmsUploadFileDescriptor,
} from '@/lib/tms/document-upload-request';

import { isAllowedPodImageMime } from './allowed-image-mime';

/**
 * Client-side validation before Supabase or TMS upload (task 6.3 / ex 4.3).
 * Aligns with TMS `documents` route: image MIME only, 50 MB max, non-empty file.
 */
export function validateDriverUploadFile(file: TmsUploadFileDescriptor): void {
  const mimeType = file.type?.trim() ?? '';

  if (!mimeType || !isAllowedPodImageMime(mimeType)) {
    throw new TmsDocumentUploadError(
      strings.loadDetail.driverUploadInvalidMime,
      'BAD_REQUEST',
    );
  }

  try {
    validateDocumentUploadFile(file);
  } catch (err) {
    if (err instanceof TmsDocumentUploadError) {
      if (err.code === 'FILE_TOO_LARGE') {
        throw new TmsDocumentUploadError(
          strings.loadDetail.driverUploadFileTooLarge,
          'FILE_TOO_LARGE',
        );
      }
      if (err.code === 'BAD_REQUEST' && file.size <= 0) {
        throw new TmsDocumentUploadError(
          strings.loadDetail.driverUploadEmptyFile,
          'BAD_REQUEST',
        );
      }
      if (err.code === 'FILENAME_TOO_LONG') {
        throw err;
      }
    }
    throw err;
  }
}
