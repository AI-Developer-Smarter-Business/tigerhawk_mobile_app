import { OfflineError } from '@/lib/network/offline-error';
import { isNetworkFailure } from '@/lib/network/network-state';
import { stripDataUrlBase64 } from '@/lib/media/signature-export';
import { tmsApiPath } from '@/lib/tms/client';
import {
  TmsMobileApiError,
  parseMobileApiErrorBody,
} from '@/lib/tms/mobile-api-error';
import { mobileLoadPodSignaturePath } from '@/lib/tms/mobile-api-routes';
import { resolveSupabaseAccessToken } from '@/lib/tms/resolve-access-token';
import { TmsStatusChangeError } from '@/lib/tms/errors';

export type PodSignatureState = 'signed' | 'pending';

export type MutatePodSignatureParams = {
  loadId: string;
  clientSignatureId: string;
  signerName: string;
  signedAt: string;
  signaturePng: string;
  latitude?: number | null;
  longitude?: number | null;
  moveId?: string | null;
  accessToken?: string;
  fetchImpl?: typeof fetch;
};

export type MutatePodSignatureResult =
  | {
      ok: true;
      state: PodSignatureState;
      signatureId: string | null;
      stampPending: boolean;
    }
  | { ok: false; error: string; mobileError?: TmsMobileApiError };

function asTrimmedString(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function requestBody(params: MutatePodSignatureParams): Record<string, unknown> {
  const body: Record<string, unknown> = {
    client_signature_id: params.clientSignatureId.trim(),
    signer_name: params.signerName.trim(),
    signed_at: params.signedAt.trim(),
    signature_png: stripDataUrlBase64(params.signaturePng),
  };
  if (params.moveId?.trim()) body.move_id = params.moveId.trim();
  if (typeof params.latitude === 'number' && Number.isFinite(params.latitude)) {
    body.latitude = params.latitude;
  }
  if (
    typeof params.longitude === 'number' &&
    Number.isFinite(params.longitude)
  ) {
    body.longitude = params.longitude;
  }
  return body;
}

/**
 * POST legal POD signature to TMS stamp (TASKS G.2 / G.3).
 * 201/200 → signed; 202 STAMP_PENDING → driver success (pending).
 */
export async function mutateMobilePodSignature(
  params: MutatePodSignatureParams,
): Promise<MutatePodSignatureResult> {
  let url: string;
  try {
    url = tmsApiPath(mobileLoadPodSignaturePath(params.loadId));
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

  const row =
    body && typeof body === 'object'
      ? (body as Record<string, unknown>)
      : null;
  const code = asTrimmedString(row?.code);
  const stampPending =
    response.status === 202 || code === 'STAMP_PENDING';

  if (response.ok || stampPending) {
    const stateRaw = asTrimmedString(row?.state);
    const state: PodSignatureState =
      stampPending || stateRaw === 'pending' ? 'pending' : 'signed';
    return {
      ok: true,
      state,
      signatureId: asTrimmedString(row?.signature_id ?? row?.signatureId),
      stampPending: state === 'pending',
    };
  }

  const mobileError =
    parseMobileApiErrorBody(body, response.status) ??
    new TmsMobileApiError(
      `Could not submit POD signature (HTTP ${response.status}).`,
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
