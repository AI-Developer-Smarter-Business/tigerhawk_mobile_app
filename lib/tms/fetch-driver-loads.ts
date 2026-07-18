import { OfflineError } from '@/lib/network/offline-error';
import { isNetworkFailure } from '@/lib/network/network-state';
import type { DriverLoadsBuckets } from '@/lib/loads/driver-move-card';
import { emptyDriverLoadsBuckets } from '@/lib/loads/partition-driver-move-cards';
import { tmsApiPath } from '@/lib/tms/client';
import { MOBILE_DRIVER_LOADS_PATH } from '@/lib/tms/mobile-api-routes';
import {
  TmsMobileApiError,
  parseMobileApiErrorBody,
} from '@/lib/tms/mobile-api-error';
import { parseDriverLoadsResponse } from '@/lib/tms/parse-driver-loads';
import { resolveSupabaseAccessToken } from '@/lib/tms/resolve-access-token';
import { TmsStatusChangeError } from '@/lib/tms/errors';

export type FetchDriverLoadsSuccess = {
  ok: true;
  buckets: DriverLoadsBuckets;
};

export type FetchDriverLoadsFailure = {
  ok: false;
  error: string;
  mobileError?: TmsMobileApiError;
};

export type FetchDriverLoadsResult =
  | FetchDriverLoadsSuccess
  | FetchDriverLoadsFailure;

/**
 * GET `/api/mobile/driver/loads` → `{ active, upcoming }` (RESPUESTAS Q14 · TASKS B.3).
 * Auth: Bearer Supabase JWT. Does not use `auth.uid` as `loads.driver_id`.
 */
export async function fetchMobileDriverLoads(params?: {
  accessToken?: string;
  fetchImpl?: typeof fetch;
}): Promise<FetchDriverLoadsResult> {
  let url: string;
  try {
    url = tmsApiPath(MOBILE_DRIVER_LOADS_PATH);
  } catch (err) {
    if (err instanceof TmsStatusChangeError && err.code === 'CONFIG') {
      return { ok: false, error: err.message };
    }
    throw err;
  }

  let token: string;
  try {
    token = params?.accessToken ?? (await resolveSupabaseAccessToken());
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Session expired. Sign in again.';
    return {
      ok: false,
      error: message,
      mobileError: new TmsMobileApiError(message, {
        code: 'UNAUTHORIZED',
        httpStatus: 401,
        appAction: 'drop_session_login',
      }),
    };
  }

  const fetchFn = params?.fetchImpl ?? fetch;
  let response: Response;
  try {
    response = await fetchFn(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (err) {
    if (err instanceof OfflineError || isNetworkFailure(err)) {
      return {
        ok: false,
        error: err instanceof Error ? err.message : 'Network request failed.',
      };
    }
    return { ok: false, error: 'Could not reach the loads server.' };
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
          ? 'Session expired. Sign in again.'
          : response.status === 403
            ? 'Mobile access is off or this account is not a truck driver. Contact dispatch.'
            : `Could not load moves (HTTP ${response.status}).`,
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

  const parsed = parseDriverLoadsResponse(body);
  if (!parsed.ok) {
    return { ok: false, error: parsed.error };
  }

  return { ok: true, buckets: parsed.buckets };
}

export function emptyFetchDriverLoadsBuckets(): DriverLoadsBuckets {
  return emptyDriverLoadsBuckets();
}
