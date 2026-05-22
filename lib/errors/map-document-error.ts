import { TmsDocumentUploadError } from '@/lib/tms/document-errors';

import { errorStrings } from './strings';
import type { UserFacingError } from './types';

/** Maps TMS `POST …/documents` errors to structured UI copy. */
export function mapDocumentUploadError(error: TmsDocumentUploadError): UserFacingError {
  switch (error.code) {
    case 'FORBIDDEN':
    case 'DOCUMENT_TYPE_FORBIDDEN':
      return {
        kind: 'permission',
        title: errorStrings.permissionTitle,
        message: error.message || errorStrings.permissionMessage,
      };
    case 'UNAUTHORIZED':
      return {
        kind: 'auth',
        title: errorStrings.authTitle,
        message: error.message || errorStrings.authMessage,
      };
    case 'NOT_FOUND':
      return {
        kind: 'not_found',
        title: errorStrings.notFoundTitle,
        message: error.message || errorStrings.notFoundMessage,
      };
    case 'FILE_TOO_LARGE':
    case 'FILENAME_TOO_LONG':
      return {
        kind: 'validation',
        title: errorStrings.validationTitle,
        message: error.message || errorStrings.genericMessage,
      };
    case 'CONFIG':
      return {
        kind: 'config',
        title: errorStrings.configTitle,
        message: error.message || errorStrings.configMessage,
      };
    case 'NETWORK':
      return {
        kind: 'network',
        title: errorStrings.networkTitle,
        message: error.message || errorStrings.networkMessage,
      };
    case 'BAD_REQUEST':
      return {
        kind: 'validation',
        title: errorStrings.validationTitle,
        message: error.message || errorStrings.genericMessage,
      };
    default:
      return {
        kind: 'generic',
        title: errorStrings.genericTitle,
        message: error.message || errorStrings.genericMessage,
      };
  }
}
