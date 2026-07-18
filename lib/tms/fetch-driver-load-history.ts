import { OfflineError } from '@/lib/network/offline-error';
import { isNetworkFailure } from '@/lib/network/network-state';
import type { DriverMoveCard } from '@/lib/loads/driver-move-card';
import { tmsApiPath } from '@/lib/tms/client';
import { MOBILE_DRIVER_LOAD_HISTORY_PATH } from '@/lib/tms/mobile-api-routes';
import {
  TmsMobileApiError,
  parseMobileApiErrorBody,
} from '@/lib/tms/mobile-api-error';
import { parseDriverLoadHistoryResponse } from '@/lib/tms/parse-driver-load-history';
import { resolveSupabaseAccessToken } from '@/lib/tms/resolve-access-token';
import { TmsStatusChangeError } from '@/lib/tms/errors';

export type FetchDriverLoadHistoryParams = {
  from: string;
  to: string;
  q?: string;
  accessToken?: string;
  fetchImpl?: typeof fetch;
};

export type FetchDriverLoadHistorySuccess = {
  ok: true;
  history: DriverMoveCard[];
};

export type FetchDriverLoadHistoryFailure = {
  ok: false;
  error: string;
  mobileError?: TmsMobileApiError;
};

export type FetchDriverLoadHistoryResult =
  | FetchDriverLoadHistorySuccess
  | FetchDriverLoadHistoryFailure;

function buildHistoryUrl(params: FetchDriverLoadHistoryParams): string {
  const base = tmsApiPath(MOBILE_DRIVER_LOAD_HISTORY_PATH);
  const search = new URLSearchParams({
    from: params.from,
    to: params.to,
  });
  const q = params.q?.trim();
  if (q) search.set('q', q);
  return `${base}?${search.toString()}`;
}

/**
 * GET `/api/mobile/driver/loads/history` (TASKS B.4).
 * Auth: Bearer Supabase JWT.
 */
export async function fetchMobileDriverLoadHistory(
  params: FetchDriverLoadHistoryParams,
): Promise<FetchDriverLoadHistoryResult> {
  let url: string;
  try {
    url = buildHistoryUrl(params);
  } catch (err) {
    if (err instanceof TmsStatusChangeError && err.code === 'CONFIG') {
      return { ok: false, error: err.message };
    }
    throw err;
  }

  let token: string;
  try {
    token = params.accessToken ?? (await resolveSupabaseAccessToken());
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

  const fetchFn = params.fetchImpl ?? fetch;
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
    if (response.status === 404) {
      return {
        ok: false,
        error: 'Load history is not available on this TMS host yet.',
        mobileError: new TmsMobileApiError(
          'Load history is not available on this TMS host yet.',
          {
            code: 'UNKNOWN',
            httpStatus: 404,
            appAction: 'generic',
            rawBody: body,
          },
        ),
      };
    }
    const mobileError =
      parseMobileApiErrorBody(body, response.status) ??
      new TmsMobileApiError(
        response.status === 401
          ? 'Session expired. Sign in again.'
          : response.status === 403
            ? 'Mobile access is off or this account is not a truck driver. Contact dispatch.'
            : `Could not load history (HTTP ${response.status}).`,
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

  const parsed = parseDriverLoadHistoryResponse(body);
  if (!parsed.ok) {
    return { ok: false, error: parsed.error };
  }

  return { ok: true, history: parsed.history };
}
