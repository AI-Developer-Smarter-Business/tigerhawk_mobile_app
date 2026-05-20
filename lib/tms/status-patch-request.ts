import type { LoadStatus } from '@/types';

/** TMS BFF contract: `PATCH /api/dispatcher/loads/[id]/status` with JSON `{ status }`. */
export type StatusPatchPayload = {
  status: LoadStatus;
};

/** Relative path (no base URL); `loadId` is URL-encoded. */
export function buildStatusPatchPath(loadId: string): string {
  return `/api/dispatcher/loads/${encodeURIComponent(loadId)}/status`;
}

export function buildStatusPatchPayload(status: LoadStatus): StatusPatchPayload {
  return { status };
}

export function buildStatusPatchBody(status: LoadStatus): string {
  return JSON.stringify(buildStatusPatchPayload(status));
}

export function buildStatusPatchHeaders(accessToken: string): Record<string, string> {
  const token = accessToken.trim();
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
}

export type StatusPatchRequestInit = {
  method: 'PATCH';
  headers: Record<string, string>;
  body: string;
};

/** Fetch init for TMS status PATCH (pure; no network). */
export function buildStatusPatchRequestInit(
  accessToken: string,
  status: LoadStatus,
): StatusPatchRequestInit {
  return {
    method: 'PATCH',
    headers: buildStatusPatchHeaders(accessToken),
    body: buildStatusPatchBody(status),
  };
}
