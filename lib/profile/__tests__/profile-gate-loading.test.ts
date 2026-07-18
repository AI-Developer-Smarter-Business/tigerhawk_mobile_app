import { isDriverIdentityLoading } from '../profile-gate-loading';

describe('isDriverIdentityLoading (A.3)', () => {
  it('blocks when not initialized', () => {
    expect(
      isDriverIdentityLoading({
        isInitialized: false,
        fetchInFlight: false,
        hasSessionDriver: false,
      }),
    ).toBe(true);
  });

  it('does not block when username login already set mobileDriver', () => {
    expect(
      isDriverIdentityLoading({
        isInitialized: true,
        fetchInFlight: true,
        hasSessionDriver: true,
      }),
    ).toBe(false);
  });

  it('blocks while resolving drivers.auth_user_id without session snapshot', () => {
    expect(
      isDriverIdentityLoading({
        isInitialized: true,
        fetchInFlight: true,
        hasSessionDriver: false,
      }),
    ).toBe(true);
  });

  it('does not block after fetch finishes', () => {
    expect(
      isDriverIdentityLoading({
        isInitialized: true,
        fetchInFlight: false,
        hasSessionDriver: false,
      }),
    ).toBe(false);
  });
});
