export type LocationErrorCode =
  | 'PERMISSION_DENIED'
  | 'SERVICES_DISABLED'
  | 'POSITION_UNAVAILABLE'
  | 'POLICY_VIOLATION';

export class LocationError extends Error {
  readonly code: LocationErrorCode;

  constructor(message: string, code: LocationErrorCode) {
    super(message);
    this.name = 'LocationError';
    this.code = code;
  }
}
