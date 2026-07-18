/**
 * Blocks driver queries while auth/identity is still resolving.
 * Does **not** wait on `user_profiles` (truck drivers have none — TASKS A.3).
 */
export function isDriverIdentityLoading(params: {
  isInitialized: boolean;
  fetchInFlight: boolean;
  /** Username-login identity already on AuthContext — no wait for drivers lookup. */
  hasSessionDriver: boolean;
}): boolean {
  if (!params.isInitialized) {
    return true;
  }
  if (params.hasSessionDriver) {
    return false;
  }
  return params.fetchInFlight;
}
