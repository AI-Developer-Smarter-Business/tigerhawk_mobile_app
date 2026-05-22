import type { LoadStatus } from '@/types';

import { assertTmsUrlReachableFromDevice } from './assert-tms-device-url';
import { assertDriverFieldStatusTarget } from './assert-driver-status';
import { tmsApiPath } from './client';
import { TmsStatusChangeError } from './errors';
import { parseStatusPatchError } from './parse-status-error';
import {
  buildStatusPatchPath,
  buildStatusPatchRequestInit,
} from './status-patch-request';

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

  assertTmsUrlReachableFromDevice();

  const url = tmsApiPath(buildStatusPatchPath(loadId));
  const init = buildStatusPatchRequestInit(accessToken, status);

  let response: Response;
  try {
    response = await fetch(url, init);
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
