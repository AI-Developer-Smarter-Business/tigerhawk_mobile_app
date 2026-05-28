import { isNetworkFailure } from '@/lib/network/network-state';
import type { ProfileQueryResult } from '@/lib/supabase/queries/profile';
import type { UserProfile } from '@/types/profile';

/**
 * Keeps the last known profile when a refetch fails due to connectivity
 * so the driver gate does not flash "No profile found" after reconnect.
 */
export function applyProfileFetchResult(
  previous: UserProfile | null,
  result: ProfileQueryResult,
): { profile: UserProfile | null; error: string | null } {
  if (result.profile) {
    return { profile: result.profile, error: null };
  }

  if (result.errorMessage && isNetworkFailure(result.errorMessage) && previous) {
    return { profile: previous, error: null };
  }

  return { profile: null, error: result.errorMessage };
}
