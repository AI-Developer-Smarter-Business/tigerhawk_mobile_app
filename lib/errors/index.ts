export type { UserFacingError, UserFacingErrorKind } from './types';
export { mapErrorToUserFacing, getUserFacingMessage } from './map-api-error';
export { mapSupabaseError } from './map-supabase-error';
export { mapStatusChangeError, mapActiveHoldsPreview } from './map-status-error';
export { mapDocumentUploadError } from './map-document-error';
export { mapMobileApiError } from './map-mobile-api-error';
export {
  MOBILE_API_CODE_CONTRACT,
  MOBILE_API_ERROR_CODES,
  isMobileApiErrorCode,
  getMobileApiCodeContract,
} from '@/lib/tms/mobile-api-error-codes';
export {
  TmsMobileApiError,
  parseMobileApiErrorBody,
  parseMobileApiResponse,
} from '@/lib/tms/mobile-api-error';
