/**
 * Mobile `/api/mobile/*` error / outcome codes (RESPUESTAS_CLIENTE · TASKS A.1).
 * Keep in sync with `z-feedback_cliente/RESPUESTAS_CLIENTE.md` § Error codes.
 */

export const MOBILE_API_ERROR_CODES = [
  'UNAUTHORIZED',
  'MOBILE_JWT_INVALID',
  'NOT_AUTHORIZED',
  'NOT_ASSIGNED',
  'CHASSIS_REQUIRED',
  'POD_SIGNATURE_REQUIRED',
  'REQUIREMENTS_NOT_MET',
  'MOVE_ALREADY_STARTED',
  'STAMP_PENDING',
  'NO_ROUTE',
] as const;

export type MobileApiErrorCode = (typeof MOBILE_API_ERROR_CODES)[number];

/** What the app should do when this code appears (RESPUESTAS “app should”). */
export type MobileApiAppAction =
  | 'drop_session_login'
  | 'drop_session_contact_dispatch'
  | 'refresh_list'
  | 'prompt_chassis'
  | 'open_signature'
  | 'show_checklist'
  | 'call_dispatch'
  | 'treat_as_success_retry_silent'
  | 'tell_dispatch'
  | 'generic';

export type MobileApiCodeContract = {
  code: MobileApiErrorCode;
  /** HTTP statuses commonly paired with this code (not exclusive). */
  typicalHttp: readonly number[];
  appAction: MobileApiAppAction;
  meaning: string;
};

export const MOBILE_API_CODE_CONTRACT: readonly MobileApiCodeContract[] = [
  {
    code: 'UNAUTHORIZED',
    typicalHttp: [401],
    appAction: 'drop_session_login',
    meaning: 'No or expired token',
  },
  {
    code: 'MOBILE_JWT_INVALID',
    typicalHttp: [401],
    appAction: 'drop_session_login',
    meaning: 'JWT invalid / expired',
  },
  {
    code: 'NOT_AUTHORIZED',
    typicalHttp: [403],
    appAction: 'drop_session_contact_dispatch',
    meaning: 'Not a driver, or mobile access revoked',
  },
  {
    code: 'NOT_ASSIGNED',
    typicalHttp: [403, 404],
    appAction: 'refresh_list',
    meaning: 'Not this driver’s move',
  },
  {
    code: 'CHASSIS_REQUIRED',
    typicalHttp: [422],
    appAction: 'prompt_chassis',
    meaning: 'Arriving at pick-up with no chassis',
  },
  {
    code: 'POD_SIGNATURE_REQUIRED',
    typicalHttp: [422],
    appAction: 'open_signature',
    meaning: 'Leaving delivery without consignee signature',
  },
  {
    code: 'REQUIREMENTS_NOT_MET',
    typicalHttp: [409],
    appAction: 'show_checklist',
    meaning: 'Complete blocked; missing[] lists gaps',
  },
  {
    code: 'MOVE_ALREADY_STARTED',
    typicalHttp: [409],
    appAction: 'call_dispatch',
    meaning: 'Reject blocked — move already underway',
  },
  {
    code: 'STAMP_PENDING',
    typicalHttp: [202],
    appAction: 'treat_as_success_retry_silent',
    meaning: 'Signature held; PDF not minted yet (success for driver)',
  },
  {
    code: 'NO_ROUTE',
    typicalHttp: [409, 422, 400],
    appAction: 'tell_dispatch',
    meaning: 'Load has no route yet',
  },
] as const;

const CODE_SET = new Set<string>(MOBILE_API_ERROR_CODES);

export function isMobileApiErrorCode(value: unknown): value is MobileApiErrorCode {
  return typeof value === 'string' && CODE_SET.has(value);
}

export function getMobileApiCodeContract(
  code: MobileApiErrorCode,
): MobileApiCodeContract {
  const row = MOBILE_API_CODE_CONTRACT.find((c) => c.code === code);
  if (!row) {
    throw new Error(`Missing contract for mobile API code: ${code}`);
  }
  return row;
}

/** Endpoints A.1 must cover (paths match `mobile-api-routes.ts`). */
export const A1_SMOKE_ENDPOINT_IDS = [
  'auth.login',
  'driver.clock',
  'driver.loads',
  'loads.progress',
  'loads.documents',
  'loads.pod',
  'loads.pod-signature',
  'loads.accept',
  'loads.reject',
] as const;

export type A1SmokeEndpointId = (typeof A1_SMOKE_ENDPOINT_IDS)[number];
