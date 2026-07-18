import { mapErrorToUserFacing, mapMobileApiError } from '@/lib/errors';
import { errorStrings } from '@/lib/errors/strings';
import {
  A1_SMOKE_ENDPOINT_IDS,
  MOBILE_API_CODE_CONTRACT,
  MOBILE_API_ERROR_CODES,
  getMobileApiCodeContract,
  isMobileApiErrorCode,
} from '@/lib/tms/mobile-api-error-codes';
import {
  TmsMobileApiError,
  parseMobileApiErrorBody,
} from '@/lib/tms/mobile-api-error';
import {
  MOBILE_AUTH_LOGIN_PATH,
  MOBILE_DRIVER_CLOCK_PATH,
  MOBILE_DRIVER_LOADS_PATH,
  mobileLoadAcceptPath,
  mobileLoadDocumentsPath,
  mobileLoadPodPath,
  mobileLoadPodSignaturePath,
  mobileLoadProgressPath,
  mobileLoadRejectPath,
} from '@/lib/tms/mobile-api-routes';

describe('mobile API error codes (A.1)', () => {
  it('lists every RESPUESTAS code exactly once in the contract', () => {
    expect(MOBILE_API_CODE_CONTRACT.map((c) => c.code).sort()).toEqual(
      [...MOBILE_API_ERROR_CODES].sort(),
    );
  });

  it('resolves appAction for every known code', () => {
    for (const code of MOBILE_API_ERROR_CODES) {
      expect(isMobileApiErrorCode(code)).toBe(true);
      expect(getMobileApiCodeContract(code).appAction).toBeTruthy();
    }
  });

  it('covers A.1 endpoint ids and matches canonical routes', () => {
    expect([...A1_SMOKE_ENDPOINT_IDS]).toEqual([
      'auth.login',
      'driver.clock',
      'driver.loads',
      'loads.progress',
      'loads.documents',
      'loads.pod',
      'loads.pod-signature',
      'loads.accept',
      'loads.reject',
    ]);
    expect(MOBILE_AUTH_LOGIN_PATH).toContain('/auth/login');
    expect(MOBILE_DRIVER_CLOCK_PATH).toContain('/driver/clock');
    expect(MOBILE_DRIVER_LOADS_PATH).toContain('/driver/loads');
    const id = 'load-1';
    expect(mobileLoadProgressPath(id)).toContain('/progress');
    expect(mobileLoadDocumentsPath(id)).toContain('/documents');
    expect(mobileLoadPodPath(id)).toContain('/pod');
    expect(mobileLoadPodSignaturePath(id)).toContain('/pod-signature');
    expect(mobileLoadAcceptPath(id)).toContain('/accept');
    expect(mobileLoadRejectPath(id)).toContain('/reject');
  });
});

describe('parseMobileApiErrorBody (A.1)', () => {
  it('parses REQUIREMENTS_NOT_MET with missing checklist', () => {
    const err = parseMobileApiErrorBody(
      {
        code: 'REQUIREMENTS_NOT_MET',
        error: 'Missing fields',
        missing: ['seal_number', 'tir_in_photo'],
      },
      409,
    );
    expect(err).toBeInstanceOf(TmsMobileApiError);
    expect(err?.code).toBe('REQUIREMENTS_NOT_MET');
    expect(err?.appAction).toBe('show_checklist');
    expect(err?.missing).toEqual(['seal_number', 'tir_in_photo']);
  });

  it('infers UNAUTHORIZED from bare 401 login body', () => {
    const err = parseMobileApiErrorBody(
      { error: 'Incorrect username or password.' },
      401,
    );
    expect(err?.code).toBe('UNAUTHORIZED');
    expect(err?.appAction).toBe('drop_session_login');
    expect(err?.shouldDropSession).toBe(true);
  });

  it('maps POD_SIGNATURE_REQUIRED to open_signature', () => {
    const err = parseMobileApiErrorBody(
      {
        code: 'POD_SIGNATURE_REQUIRED',
        error: "Capture the consignee's signature before leaving the delivery",
      },
      422,
    );
    expect(err?.appAction).toBe('open_signature');
  });

  it('treats STAMP_PENDING as driver success', () => {
    const err = new TmsMobileApiError('pending', {
      code: 'STAMP_PENDING',
      httpStatus: 202,
      appAction: 'treat_as_success_retry_silent',
    });
    expect(err.isDriverSuccess).toBe(true);
  });
});

describe('mapMobileApiError (A.1)', () => {
  it('exposes checklist details for REQUIREMENTS_NOT_MET', () => {
    const err = new TmsMobileApiError('blocked', {
      code: 'REQUIREMENTS_NOT_MET',
      httpStatus: 409,
      appAction: 'show_checklist',
      missing: ['chassis_number'],
    });
    const mapped = mapMobileApiError(err);
    expect(mapped.kind).toBe('validation');
    expect(mapped.details).toEqual(['chassis_number']);
    expect(mapped.title).toBe(errorStrings.mobileRequirementsTitle);
  });

  it('is reachable from mapErrorToUserFacing', () => {
    const err = new TmsMobileApiError('revoked', {
      code: 'NOT_AUTHORIZED',
      httpStatus: 403,
      appAction: 'drop_session_contact_dispatch',
    });
    const mapped = mapErrorToUserFacing(err);
    expect(mapped.message).toBe(errorStrings.mobileAccessContactDispatch);
  });
});
