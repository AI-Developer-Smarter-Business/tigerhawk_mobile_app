/** Categories for consistent error UI (task 3.4). */
export type UserFacingErrorKind =
  | 'auth'
  | 'permission'
  | 'active_holds'
  | 'not_found'
  | 'validation'
  | 'network'
  | 'config'
  | 'generic';

export type UserFacingError = {
  kind: UserFacingErrorKind;
  title: string;
  message: string;
  /** Optional bullets (e.g. hold names, valid next statuses). */
  details?: string[];
};
