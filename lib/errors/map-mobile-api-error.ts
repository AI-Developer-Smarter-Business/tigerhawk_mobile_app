import { errorStrings } from './strings';
import type { UserFacingError } from './types';
import { TmsMobileApiError } from '@/lib/tms/mobile-api-error';

/**
 * Maps RESPUESTAS mobile API codes to driver-facing copy (TASKS A.1).
 * Session drop / navigation is driven by `error.appAction` in callers (A.4 wires auth gates).
 */
export function mapMobileApiError(error: TmsMobileApiError): UserFacingError {
  switch (error.appAction) {
    case 'drop_session_login':
      return {
        kind: 'auth',
        title: errorStrings.authTitle,
        message: errorStrings.authMessage,
      };
    case 'drop_session_contact_dispatch':
      return {
        kind: 'permission',
        title: errorStrings.mobileAccessTitle,
        message: errorStrings.mobileAccessContactDispatch,
      };
    case 'refresh_list':
      return {
        kind: 'not_found',
        title: errorStrings.notFoundTitle,
        message: errorStrings.mobileNotAssigned,
      };
    case 'prompt_chassis':
      return {
        kind: 'validation',
        title: errorStrings.mobileChassisTitle,
        message: errorStrings.mobileChassisRequired,
      };
    case 'open_signature':
      return {
        kind: 'validation',
        title: errorStrings.mobilePodTitle,
        message: errorStrings.mobilePodSignatureRequired,
      };
    case 'show_checklist':
      return {
        kind: 'validation',
        title: errorStrings.mobileRequirementsTitle,
        message: errorStrings.mobileRequirementsMessage,
        details: error.missing.length > 0 ? error.missing : undefined,
      };
    case 'call_dispatch':
      return {
        kind: 'validation',
        title: errorStrings.mobileMoveStartedTitle,
        message: errorStrings.mobileCallDispatch,
      };
    case 'treat_as_success_retry_silent':
      return {
        kind: 'generic',
        title: errorStrings.mobileStampPendingTitle,
        message: errorStrings.mobileStampPendingMessage,
      };
    case 'tell_dispatch':
      return {
        kind: 'generic',
        title: errorStrings.mobileNoRouteTitle,
        message: errorStrings.mobileTellDispatch,
      };
    default:
      return {
        kind: 'generic',
        title: errorStrings.genericTitle,
        message: error.message || errorStrings.genericMessage,
      };
  }
}
