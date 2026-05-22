/** Error codes aligned to TMS `POST …/loads/[id]/documents` responses. */
export type TmsDocumentErrorCode =
  | 'CONFIG'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'DOCUMENT_TYPE_FORBIDDEN'
  | 'FILE_TOO_LARGE'
  | 'FILENAME_TOO_LONG'
  | 'NOT_FOUND'
  | 'BAD_REQUEST'
  | 'NETWORK'
  | 'UNKNOWN';

export class TmsDocumentUploadError extends Error {
  readonly code: TmsDocumentErrorCode;

  constructor(message: string, code: TmsDocumentErrorCode) {
    super(message);
    this.name = 'TmsDocumentUploadError';
    this.code = code;
  }
}
