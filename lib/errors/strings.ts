/** User-facing error copy (English) — task 3.4. */
export const errorStrings = {
  genericTitle: 'Something went wrong',
  genericMessage: 'Please try again. If the problem continues, contact dispatch.',

  networkTitle: 'Connection problem',
  networkMessage: 'Check your internet connection and try again.',

  authTitle: 'Session expired',
  authMessage: 'Sign in again to continue.',

  permissionTitle: 'Not allowed',
  permissionMessage:
    "You don't have permission to perform this action on this load.",

  holdsTitle: 'Status blocked by holds',
  holdsMessage:
    'Release or clear active holds in the TMS before changing status.',
  holdsContact: 'Contact dispatch if you need help.',

  notFoundTitle: 'Not found',
  notFoundMessage: 'This load is no longer available or was not assigned to you.',

  validationTitle: 'Invalid action',
  validationTransition: 'That status change is not allowed from the current state.',
  validationAllowedPrefix: 'Allowed next statuses:',

  configTitle: 'App not configured',
  configMessage: 'TMS API URL is missing. Contact your administrator.',

  postgrestPermission:
    'You do not have access to this data. Sign in as a driver with assigned loads.',
  postgrestJwt: 'Your session expired. Sign in again.',

  // Mobile /api/mobile/* (RESPUESTAS · A.1)
  mobileAccessTitle: 'Access revoked',
  mobileAccessContactDispatch:
    'Your mobile access is off or this account is not a truck driver. Contact dispatch.',
  mobileNotAssigned:
    'This move is no longer assigned to you. Pull to refresh your load list.',
  mobileChassisTitle: 'Chassis required',
  mobileChassisRequired:
    'Enter the chassis number before arriving at this pick-up stop.',
  mobilePodTitle: 'Signature required',
  mobilePodSignatureRequired:
    "Capture the consignee's signature before leaving the delivery stop.",
  mobileRequirementsTitle: 'Cannot complete yet',
  mobileRequirementsMessage: 'Finish the missing items, then try Complete again.',
  mobileMoveStartedTitle: 'Move already started',
  mobileCallDispatch: 'Call dispatch — this move cannot be rejected.',
  mobileStampPendingTitle: 'Signature saved',
  mobileStampPendingMessage:
    'POD stamp is still processing. You can continue; the app will retry quietly.',
  mobileNoRouteTitle: 'No route yet',
  mobileTellDispatch: 'This load has no route. Tell dispatch — it is not a driver issue.',
} as const;
