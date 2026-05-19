import { strings } from '@/constants/strings';

export type DriverQueryGateInput = {
  isSupabaseAuthenticated: boolean;
  profileLoading: boolean;
  isDriver: boolean;
  hasProfile: boolean;
};

/** Error message when loads/detail queries must not run (not driver, no profile, etc.). */
export function getDriverQueryGateError(input: DriverQueryGateInput): string | null {
  const { isSupabaseAuthenticated, profileLoading, isDriver, hasProfile } = input;
  if (!isSupabaseAuthenticated || profileLoading) {
    return null;
  }
  if (!isDriver) {
    return hasProfile ? strings.auth.notDriverRole : strings.account.noProfile;
  }
  return null;
}

export function isDriverLoadsQueryEnabled(params: {
  isInitialized: boolean;
  isSupabaseAuthenticated: boolean;
  profileLoading: boolean;
  isDriver: boolean;
  userId: string | undefined;
}): boolean {
  return (
    params.isInitialized &&
    params.isSupabaseAuthenticated &&
    !params.profileLoading &&
    params.isDriver &&
    Boolean(params.userId)
  );
}
