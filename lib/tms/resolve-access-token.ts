import { getSupabase } from '@/lib/supabase/client';

import { TmsDocumentUploadError } from './document-errors';

const REFRESH_BUFFER_SEC = 60;

function sessionExpiredMessage(): TmsDocumentUploadError {
  return new TmsDocumentUploadError('Session expired. Sign in again.', 'UNAUTHORIZED');
}

function isExpired(expiresAt: number | undefined): boolean {
  if (!expiresAt) return false;
  return expiresAt * 1000 <= Date.now() + REFRESH_BUFFER_SEC * 1000;
}

/**
 * Returns a fresh Supabase access token for TMS BFF calls (auto-refresh when possible).
 */
export async function resolveSupabaseAccessToken(): Promise<string> {
  const supabase = getSupabase();
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    throw sessionExpiredMessage();
  }

  let session = data.session;
  if (!session?.access_token || isExpired(session.expires_at)) {
    const { data: refreshed, error: refreshError } = await supabase.auth.refreshSession();
    if (refreshError || !refreshed.session?.access_token) {
      throw sessionExpiredMessage();
    }
    session = refreshed.session;
  }

  return session.access_token;
}
