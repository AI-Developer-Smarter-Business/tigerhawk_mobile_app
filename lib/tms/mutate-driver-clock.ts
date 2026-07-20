import { OfflineError } from '@/lib/network/offline-error';
import { isNetworkFailure } from '@/lib/network/network-state';
import { tmsApiPath } from '@/lib/tms/client';
import {
  TmsMobileApiError,
  parseMobileApiErrorBody,
} from '@/lib/tms/mobile-api-error';
import { MOBILE_DRIVER_CLOCK_PATH } from '@/lib/tms/mobile-api-routes';
import {
  parseDriverClockPostResponse,
  type DriverClockMutationResult,
} from '@/lib/tms/parse-driver-clock';
import { resolveSupabaseAccessToken } from '@/lib/tms/resolve-access-token';
import { TmsStatusChangeError } from '@/lib/tms/errors';

export type DriverClockEvent = 'in' | 'out';

export type MutateDriverClockResult =
  | { ok: true; result: DriverClockMutationResult }
  | { ok: false; error: string; mobileError?: TmsMobileApiError };

/**
 * POST `/api/mobile/driver/clock` with `{ event: "in" | "out" }` (TASKS I.2).
 */
export async function mutateMobileDriverClock(params: {
  event: DriverClockEvent;
  accessToken?: string;
  fetchImpl?: typeof fetch;
}): Promise<MutateDriverClockResult> {
  let url: string;
  try {
    url = tmsApiPath(MOBILE_DRIVER_CLOCK_PATH);
  } catch (error) {
    if (error instanceof TmsStatusChangeError && error.code === 'CONFIG') {
      return { ok: false, error: error.message };
    }
    throw error;
  }

  let token: string;
  try {
    token = params.accessToken ?? (await resolveSupabaseAccessToken());
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Session expired. Sign in again.';
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

  let response: Response;
  try {
    response = await (params.fetchImpl ?? fetch)(url, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ event: params.event }),
    });
  } catch (error) {
    if (error instanceof OfflineError || isNetworkFailure(error)) {
      return {
        ok: false,
        error:
          error instanceof Error ? error.message : 'Network request failed.',
      };
    }
    return { ok: false, error: 'Could not reach the clock server.' };
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
        `Could not update clock (HTTP ${response.status}).`,
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

  return parseDriverClockPostResponse(body);
}
