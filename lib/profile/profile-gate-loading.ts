import type { UserProfile } from '@/types/profile';

/**
 * Blocks driver queries only on the first profile load — not on silent reconnect refetch.
 */
export function isProfileGateLoading(
  isInitialized: boolean,
  fetchInFlight: boolean,
  profile: UserProfile | null,
): boolean {
  if (!isInitialized) {
    return true;
  }
  return fetchInFlight && profile === null;
}
