import * as QueryParams from 'expo-auth-session/build/QueryParams';

import { safeLog } from '@/lib/logging/safe-log';
import { getSupabase } from '@/lib/supabase/client';

export type AuthCallbackResult =
  | { ok: true }
  | { ok: false; error: string; errorCode?: string };

/**
 * Completes Supabase auth from a deep link (PKCE `code` or implicit hash tokens).
 * Does not log tokens or credentials.
 */
export async function handleAuthCallbackUrl(url: string): Promise<AuthCallbackResult> {
  const { params, errorCode } = QueryParams.getQueryParams(url);

  if (errorCode) {
    safeLog.warn('auth.callback', `Auth redirect error: ${errorCode}`);
    return {
      ok: false,
      error: 'Sign-in link failed or expired.',
      errorCode,
    };
  }

  const supabase = getSupabase();
  const code = params.code;

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      safeLog.error('auth.exchangeCode', error.message);
      return { ok: false, error: error.message };
    }
    return { ok: true };
  }

  const accessToken = params.access_token;
  const refreshToken = params.refresh_token;

  if (accessToken && refreshToken) {
    const { error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
    if (error) {
      safeLog.error('auth.setSession', error.message);
      return { ok: false, error: error.message };
    }
    return { ok: true };
  }

  return { ok: false, error: 'Invalid sign-in redirect.' };
}
