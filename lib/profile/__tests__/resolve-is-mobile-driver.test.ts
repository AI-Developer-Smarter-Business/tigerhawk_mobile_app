import {
  resolveAssignedDriverId,
  resolveIsMobileDriver,
} from '@/lib/profile/resolve-is-mobile-driver';

describe('resolveIsMobileDriver (A.3)', () => {
  it('accepts username-login mobileDriver', () => {
    expect(
      resolveIsMobileDriver({
        mobileDriver: { id: 'd1', name: 'A', username: 'u' },
        linkedDriver: null,
      }),
    ).toBe(true);
  });

  it('accepts drivers.auth_user_id link (session restore / email bridge)', () => {
    expect(
      resolveIsMobileDriver({
        mobileDriver: null,
        linkedDriver: { id: 'd1', name: 'A', username: 'u' },
      }),
    ).toBe(true);
  });

  it('never gates on user_profiles.role === driver', () => {
    expect(
      resolveIsMobileDriver({
        mobileDriver: null,
        linkedDriver: null,
      }),
    ).toBe(false);
  });
});

describe('resolveAssignedDriverId (A.3)', () => {
  it('prefers mobileDriver.id over linkedDriver', () => {
    expect(
      resolveAssignedDriverId({
        mobileDriver: { id: 'from-login', name: 'A', username: 'u' },
        linkedDriver: { id: 'from-link', name: 'B', username: 'v' },
      }),
    ).toBe('from-login');
  });

  it('uses linkedDriver when session has no mobileDriver snapshot', () => {
    expect(
      resolveAssignedDriverId({
        mobileDriver: null,
        linkedDriver: { id: 'd-row', name: 'A', username: 'u' },
      }),
    ).toBe('d-row');
  });

  it('returns null without a drivers row id', () => {
    expect(
      resolveAssignedDriverId({ mobileDriver: null, linkedDriver: null }),
    ).toBeNull();
  });
});
