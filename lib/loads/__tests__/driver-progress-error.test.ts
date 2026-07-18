import { mapDriverProgressError } from '../driver-progress-error';
import { parseMobileApiErrorBody } from '@/lib/tms/mobile-api-error';

describe('mapDriverProgressError (D.6)', () => {
  it.each([
    ['CHASSIS_REQUIRED', 422, 'prompt_chassis'],
    ['POD_SIGNATURE_REQUIRED', 422, 'open_signature'],
    ['NOT_ASSIGNED', 403, 'refresh_list'],
    ['NO_ROUTE', 409, 'tell_dispatch'],
  ] as const)('preserves %s as %s', (code, status, appAction) => {
    const apiError = parseMobileApiErrorBody(
      { code, error: `Server message for ${code}` },
      status,
    );

    const mapped = mapDriverProgressError(apiError);

    expect(mapped.code).toBe(code);
    expect(mapped.appAction).toBe(appAction);
    expect(mapped.title).toBeTruthy();
    expect(mapped.message).toBeTruthy();
  });

  it('preserves the exact REQUIREMENTS_NOT_MET checklist', () => {
    const apiError = parseMobileApiErrorBody(
      {
        code: 'REQUIREMENTS_NOT_MET',
        error: 'Complete requirements first',
        missing: ['seal_number', 'tir_in_photo'],
      },
      409,
    );

    const mapped = mapDriverProgressError(apiError);

    expect(mapped.appAction).toBe('show_checklist');
    expect(mapped.details).toEqual(['seal_number', 'tir_in_photo']);
  });

  it('maps non-mobile failures to a generic structured error', () => {
    const mapped = mapDriverProgressError(new Error('Network unavailable'));

    expect(mapped.code).toBe('UNKNOWN');
    expect(mapped.appAction).toBe('generic');
    expect(mapped.message).toContain('Network unavailable');
  });
});
