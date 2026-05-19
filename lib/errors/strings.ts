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
} as const;
