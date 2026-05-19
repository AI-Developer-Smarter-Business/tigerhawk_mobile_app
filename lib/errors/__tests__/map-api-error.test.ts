import { TmsStatusChangeError } from '@/lib/tms/errors';

import {
  mapErrorToUserFacing,
  mapStatusChangeError,
  mapSupabaseError,
} from '../index';

describe('mapSupabaseError', () => {
  it('maps RLS permission denied', () => {
    const result = mapSupabaseError({
      message: 'new row violates row-level security policy',
      code: '42501',
    });
    expect(result.kind).toBe('permission');
    expect(result.title).toMatch(/Not allowed/i);
  });

  it('maps JWT expired', () => {
    const result = mapSupabaseError({ message: 'JWT expired', code: 'PGRST301' });
    expect(result.kind).toBe('auth');
  });
});

describe('mapStatusChangeError', () => {
  it('maps ACTIVE_HOLDS with formatted hold labels', () => {
    const err = new TmsStatusChangeError('Holds active', 'ACTIVE_HOLDS', {
      activeHolds: ['freight_hold', 'customs_hold'],
    });
    const result = mapStatusChangeError(err);
    expect(result.kind).toBe('active_holds');
    expect(result.details).toContain('Freight');
    expect(result.details).toContain('Customs');
  });

  it('maps FORBIDDEN permission', () => {
    const err = new TmsStatusChangeError(
      "You don't have permission to update this load status",
      'FORBIDDEN',
    );
    const result = mapStatusChangeError(err);
    expect(result.kind).toBe('permission');
  });
});

describe('mapErrorToUserFacing', () => {
  it('routes TmsStatusChangeError through status mapper', () => {
    const result = mapErrorToUserFacing(
      new TmsStatusChangeError('x', 'ACTIVE_HOLDS', { activeHolds: ['fees_hold'] }),
    );
    expect(result.kind).toBe('active_holds');
  });
});
