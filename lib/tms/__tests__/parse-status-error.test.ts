import { parseStatusPatchError } from '../parse-status-error';

describe('parseStatusPatchError', () => {
  it('maps ACTIVE_HOLDS 403', () => {
    const err = parseStatusPatchError(403, {
      code: 'ACTIVE_HOLDS',
      error: 'Cannot change load status while active holds are set.',
      activeHolds: ['freight_hold', 'customs_hold'],
    });
    expect(err.code).toBe('ACTIVE_HOLDS');
    expect(err.message).toContain('Freight');
    expect(err.activeHolds).toEqual(['freight_hold', 'customs_hold']);
  });

  it('maps invalid transition 400 with validNextStates', () => {
    const err = parseStatusPatchError(400, {
      error: 'Invalid status transition from Dispatched to Completed',
      validNextStates: ['In Transit'],
    });
    expect(err.code).toBe('INVALID_TRANSITION');
    expect(err.validNextStates).toEqual(['In Transit']);
  });

  it('maps permission 403', () => {
    const err = parseStatusPatchError(403, {
      error: "You don't have permission to update this load status",
    });
    expect(err.code).toBe('FORBIDDEN');
  });

  it('maps 401', () => {
    const err = parseStatusPatchError(401, { error: 'Unauthorized' });
    expect(err.code).toBe('UNAUTHORIZED');
  });
});
