/**
 * Public Supabase layer for PP2 mobile (anon client + queries + hooks).
 * Do not import service role or admin helpers here.
 */
export { getSupabase, resetSupabaseClientForTests } from './client';
export {
  fetchInitialSession,
  subscribeToAuthChanges,
  type AuthSubscription,
  type InitialSessionResult,
} from './auth-session';
export { handleAuthCallbackUrl } from './auth-callback';
export { fetchUserProfile, fetchLoadsForDriver } from './queries';
export { useAuth } from './hooks/useAuth';
export { useProfile } from './hooks/useProfile';
export type { UseProfileResult } from './hooks/useProfile';
