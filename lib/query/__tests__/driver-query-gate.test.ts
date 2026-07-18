import { strings } from '@/constants/strings';
import {
  getDriverQueryGateError,
  isDriverLoadsQueryEnabled,
} from '@/lib/query/driver-query-gate';

describe('driver-query-gate (A.3)', () => {
  it('does not use user_profiles absence as the block reason', () => {
    expect(
      getDriverQueryGateError({
        isSupabaseAuthenticated: true,
        profileLoading: false,
        isDriver: false,
      }),
    ).toBe(strings.auth.notDriverRole);
  });

  it('requires drivers.id before enabling load queries', () => {
    expect(
      isDriverLoadsQueryEnabled({
        isInitialized: true,
        isSupabaseAuthenticated: true,
        profileLoading: false,
        isDriver: true,
        driverId: undefined,
      }),
    ).toBe(false);

    expect(
      isDriverLoadsQueryEnabled({
        isInitialized: true,
        isSupabaseAuthenticated: true,
        profileLoading: false,
        isDriver: true,
        driverId: 'driver-row-uuid',
      }),
    ).toBe(true);
  });
});
