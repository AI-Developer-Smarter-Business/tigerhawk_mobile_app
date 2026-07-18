import { OfflineError } from '@/lib/network/offline-error';
import { isNetworkFailure } from '@/lib/network/network-state';
import { tmsApiPath } from '@/lib/tms/client';
import {
  TmsMobileApiError,
  parseMobileApiErrorBody,
} from '@/lib/tms/mobile-api-error';
import {
  mobileLoadAcceptPath,
  mobileLoadRejectPath,
} from '@/lib/tms/mobile-api-routes';
import { resolveSupabaseAccessToken } from '@/lib/tms/resolve-access-token';
import { TmsStatusChangeError } from '@/lib/tms/errors';

export type DriverMoveOfferAction = 'accept' | 'reject';

type MutateDriverMoveOfferParams = {
  action: DriverMoveOfferAction;
  loadId: string;
  moveId: string;
  /** C.2 will expose `true`; C.1 accepts now and starts later. */
  start?: boolean;
  reason?: string;
  accessToken?: string;
  fetchImpl?: typeof fetch;
};

export type MutateDriverMoveOfferResult =
  | { ok: true; moveId: string }
  | { ok: false; error: string; mobileError?: TmsMobileApiError };

function asRecord(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === 'object'
    ? (value as Record<string, unknown>)
    : null;
}

function requestBody(params: MutateDriverMoveOfferParams): Record<string, unknown> {
  if (params.action === 'accept') {
    return {
      move_id: params.moveId,
      start: params.start === true,
    };
  }

  const body: Record<string, unknown> = { move_id: params.moveId };
  const reason = params.reason?.trim();
  if (reason) body.reason = reason;
  return body;
}

/**
 * POST accept/reject for one move. The load id scopes the URL; `move_id` is
 * always sent because ownership and acceptance are move-scoped (TASKS C.1).
 */
export async function mutateMobileDriverMoveOffer(
  params: MutateDriverMoveOfferParams,
): Promise<MutateDriverMoveOfferResult> {
  let url: string;
  try {
    const path =
      params.action === 'accept'
        ? mobileLoadAcceptPath(params.loadId)
        : mobileLoadRejectPath(params.loadId);
    url = tmsApiPath(path);
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
      body: JSON.stringify(requestBody(params)),
    });
  } catch (error) {
    if (error instanceof OfflineError || isNetworkFailure(error)) {
      return {
        ok: false,
        error:
          error instanceof Error ? error.message : 'Network request failed.',
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
        `Could not ${params.action} move (HTTP ${response.status}).`,
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

  const result = asRecord(body);
  const returnedMoveId =
    typeof result?.move_id === 'string' ? result.move_id.trim() : '';
  if (result?.ok !== true || returnedMoveId !== params.moveId) {
    return {
      ok: false,
      error: 'Move response did not match the requested move.',
    };
  }

  return { ok: true, moveId: returnedMoveId };
}
