/** Error codes aligned to TMS `PATCH …/loads/[id]/status` responses. */
export type TmsStatusErrorCode =
  | 'CONFIG'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'ACTIVE_HOLDS'
  | 'INVALID_TRANSITION'
  | 'NOT_FOUND'
  | 'BAD_REQUEST'
  | 'NETWORK'
  | 'UNKNOWN';

export class TmsStatusChangeError extends Error {
  readonly code: TmsStatusErrorCode;
  readonly activeHolds?: string[];
  readonly validNextStates?: string[];

  constructor(
    message: string,
    code: TmsStatusErrorCode,
    options?: { activeHolds?: string[]; validNextStates?: string[] },
  ) {
    super(message);
    this.name = 'TmsStatusChangeError';
    this.code = code;
    this.activeHolds = options?.activeHolds;
    this.validNextStates = options?.validNextStates;
  }
}

/** @deprecated Prefer `mapErrorToUserFacing` from `@/lib/errors`. */
export function getStatusChangeErrorMessage(error: unknown): string {
  if (error instanceof TmsStatusChangeError) return error.message;
  if (error instanceof Error && error.message) return error.message;
  return 'Failed to update status.';
}
