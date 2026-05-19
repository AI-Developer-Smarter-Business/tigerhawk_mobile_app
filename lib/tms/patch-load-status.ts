import type { LoadStatus } from '@/types';

import { assertDriverFieldStatusTarget } from './assert-driver-status';
import { TmsStatusChangeError } from './errors';
import { tmsApiPath } from './client';
import { parseStatusPatchError } from './parse-status-error';

export type PatchLoadStatusParams = {
  loadId: string;
  status: LoadStatus;
  accessToken: string;
  /** When true (default), reject non–driver-field targets before calling TMS. */
  enforceDriverFieldOnly?: boolean;
};

/**
 * Persists a driver/staff status change via the TMS BFF.
 * Contract: `PATCH /api/dispatcher/loads/[id]/status` with `{ status }`.
 * @see PROYECTO_MUESTRA/components/dispatcher/DriverActionPanel.tsx
 */
export async function patchLoadStatus(
  params: PatchLoadStatusParams,
): Promise<void> {
  const { loadId, status, accessToken, enforceDriverFieldOnly = true } = params;

  if (enforceDriverFieldOnly) {
    assertDriverFieldStatusTarget(status);
  }

  const url = tmsApiPath(
    `/api/dispatcher/loads/${encodeURIComponent(loadId)}/status`,
  );

  let response: Response;
  try {
    response = await fetch(url, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ status }),
    });
  } catch {
    throw new TmsStatusChangeError(
      'Network error. Check your connection and try again.',
      'NETWORK',
    );
  }

  const raw = await response.text();
  let body: unknown = null;
  if (raw) {
    try {
      body = JSON.parse(raw) as unknown;
    } catch {
      body = null;
    }
  }

  if (!response.ok) {
    throw parseStatusPatchError(response.status, body);
  }
}
