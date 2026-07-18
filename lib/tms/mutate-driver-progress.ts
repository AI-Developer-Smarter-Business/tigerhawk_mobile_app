import { OfflineError } from '@/lib/network/offline-error';
import { isNetworkFailure } from '@/lib/network/network-state';
import type {
  DriverLoadProgress,
  DriverProgressAction,
} from '@/lib/loads/driver-progress';
import { tmsApiPath } from '@/lib/tms/client';
import {
  TmsMobileApiError,
  parseMobileApiErrorBody,
} from '@/lib/tms/mobile-api-error';
import { mobileLoadProgressPath } from '@/lib/tms/mobile-api-routes';
import { parseDriverProgressResponse } from '@/lib/tms/parse-driver-progress';
import { resolveSupabaseAccessToken } from '@/lib/tms/resolve-access-token';
import { TmsStatusChangeError } from '@/lib/tms/errors';

export type MutateDriverProgressParams = {
  action: DriverProgressAction;
  loadId: string;
  moveId?: string;
  chassisNumber?: string;
  containerNumber?: string;
  sealNumber?: string;
  note?: string;
  accessToken?: string;
  fetchImpl?: typeof fetch;
};

export type MutateDriverProgressResult =
  | { ok: true; progress: DriverLoadProgress }
  | { ok: false; error: string; mobileError?: TmsMobileApiError };

function requestBody(params: MutateDriverProgressParams): Record<string, string> {
  const body: Record<string, string> = { action: params.action };
  if (params.moveId) body.move_id = params.moveId;
  const chassisNumber = params.chassisNumber?.trim();
  if (chassisNumber) body.chassis_number = chassisNumber;
  const containerNumber = params.containerNumber?.trim();
  if (containerNumber) body.container_number = containerNumber;
  const sealNumber = params.sealNumber?.trim();
  if (sealNumber) body.seal_number = sealNumber;
  const note = params.note?.trim();
  if (note) body.note = note;
  return body;
}

/**
 * POST one semantic driver action to the canonical progress route.
 * The phone never sends a raw load status.
 */
export async function mutateMobileDriverProgress(
  params: MutateDriverProgressParams,
): Promise<MutateDriverProgressResult> {
  let url: string;
  try {
    url = tmsApiPath(mobileLoadProgressPath(params.loadId));
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
        `Could not update move progress (HTTP ${response.status}).`,
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

  return parseDriverProgressResponse(body);
}
