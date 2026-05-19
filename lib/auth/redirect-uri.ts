import { makeRedirectUri } from 'expo-auth-session';

/** Redirect URL for Supabase magic links / OAuth (scheme `pp2` in app.json). */
export function getAuthRedirectUri(): string {
  return makeRedirectUri({
    scheme: 'pp2',
    path: 'auth/callback',
  });
}
