import { strings } from '@/constants/strings';

export type DriverQueryGateInput = {
  isSupabaseAuthenticated: boolean;
  profileLoading: boolean;
  isDriver: boolean;
};

/** Error when loads/detail queries must not run (not a mobile driver). */
export function getDriverQueryGateError(input: DriverQueryGateInput): string | null {
  const { isSupabaseAuthenticated, profileLoading, isDriver } = input;
  if (!isSupabaseAuthenticated || profileLoading) {
    return null;
  }
  if (!isDriver) {
    return strings.auth.notDriverRole;
  }
  return null;
}

export function isDriverLoadsQueryEnabled(params: {
  isInitialized: boolean;
  isSupabaseAuthenticated: boolean;
  profileLoading: boolean;
  isDriver: boolean;
  /** `drivers.id` for `loads.driver_id` (not auth uid). */
  driverId: string | undefined;
}): boolean {
  return (
    params.isInitialized &&
    params.isSupabaseAuthenticated &&
    !params.profileLoading &&
    params.isDriver &&
    Boolean(params.driverId)
  );
}
