import { OfflineError } from '@/lib/network/offline-error';
import { isNetworkFailure } from '@/lib/network/network-state';
import { tmsApiPath } from '@/lib/tms/client';
import { MOBILE_AUTH_LOGIN_PATH } from '@/lib/tms/mobile-api-routes';
import {
  TmsMobileApiError,
  parseMobileApiErrorBody,
} from '@/lib/tms/mobile-api-error';
import { TmsStatusChangeError } from '@/lib/tms/errors';
import type { MobileDriverIdentity } from '@/lib/tms/mobile-driver-identity';

export type { MobileDriverIdentity } from '@/lib/tms/mobile-driver-identity';

export type MobileAuthSessionTokens = {
  access_token: string;
  refresh_token: string;
  expires_at?: number;
  token_type?: string;
};

export type MobileAuthLoginSuccess = {
  session: MobileAuthSessionTokens;
  driver: MobileDriverIdentity;
};

export type MobileAuthLoginFailure = {
  ok: false;
  error: string;
  mobileError?: TmsMobileApiError;
};

export type MobileAuthLoginResult =
  | ({ ok: true } & MobileAuthLoginSuccess)
  | MobileAuthLoginFailure;

function asObject(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === 'object'
    ? (value as Record<string, unknown>)
    : null;
}

function parseDriver(raw: unknown): MobileDriverIdentity | null {
  const obj = asObject(raw);
  if (!obj) return null;
  const id = typeof obj.id === 'string' ? obj.id.trim() : '';
  const name = typeof obj.name === 'string' ? obj.name.trim() : '';
  const username = typeof obj.username === 'string' ? obj.username.trim() : '';
  if (!id || !username) return null;
  return { id, name: name || username, username };
}

function parseSession(raw: unknown): MobileAuthSessionTokens | null {
  const obj = asObject(raw);
  if (!obj) return null;
  const access_token =
    typeof obj.access_token === 'string' ? obj.access_token.trim() : '';
  const refresh_token =
    typeof obj.refresh_token === 'string' ? obj.refresh_token.trim() : '';
  if (!access_token || !refresh_token) return null;
  const expires_at =
    typeof obj.expires_at === 'number' && Number.isFinite(obj.expires_at)
      ? obj.expires_at
      : undefined;
  const token_type =
    typeof obj.token_type === 'string' ? obj.token_type : undefined;
  return { access_token, refresh_token, expires_at, token_type };
}

/**
 * POST `/api/mobile/auth/login` — username/password → Supabase session tokens
 * (RESPUESTAS Q1 · TASKS A.2). Does not call `setSession`; the auth layer does.
 */
export async function loginMobileDriverWithUsername(params: {
  username: string;
  password: string;
  fetchImpl?: typeof fetch;
}): Promise<MobileAuthLoginResult> {
  const username = params.username.trim();
  const password = params.password;
  if (!username || !password) {
    return { ok: false, error: 'Username and password are required.' };
  }

  let url: string;
  try {
    url = tmsApiPath(MOBILE_AUTH_LOGIN_PATH);
  } catch (err) {
    if (err instanceof TmsStatusChangeError && err.code === 'CONFIG') {
      return { ok: false, error: err.message };
    }
    throw err;
  }

  const fetchFn = params.fetchImpl ?? fetch;
  let response: Response;
  try {
    response = await fetchFn(url, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });
  } catch (err) {
    if (err instanceof OfflineError || isNetworkFailure(err)) {
      return {
        ok: false,
        error: err instanceof Error ? err.message : 'Network request failed.',
      };
    }
    return { ok: false, error: 'Could not reach the sign-in server.' };
  }

  let body: unknown = null;
  const contentType = response.headers.get('content-type') ?? '';
  if (contentType.includes('application/json')) {
    try {
      body = await response.json();
    } catch {
      body = null;
    }
  }

  if (!response.ok) {
    const mobileError =
      parseMobileApiErrorBody(body, response.status) ??
      new TmsMobileApiError(
        response.status === 401
          ? 'Incorrect username or password.'
          : response.status === 404
            ? 'Username login is not deployed on this TMS host (POST /api/mobile/auth/login missing).'
            : `Sign-in failed (HTTP ${response.status}).`,
        {
          code:
            response.status === 401
              ? 'UNAUTHORIZED'
              : response.status === 403
                ? 'NOT_AUTHORIZED'
                : 'UNKNOWN',
          httpStatus: response.status,
          appAction:
            response.status === 401
              ? 'drop_session_login'
              : response.status === 403
                ? 'drop_session_contact_dispatch'
                : 'generic',
          rawBody: body,
        },
      );
    return { ok: false, error: mobileError.message, mobileError };
  }

  const root = asObject(body);
  const session = parseSession(root?.session);
  const driver = parseDriver(root?.driver);
  if (!session || !driver) {
    return {
      ok: false,
      error: 'Sign-in response was incomplete. Contact dispatch.',
    };
  }

  return { ok: true, session, driver };
}
