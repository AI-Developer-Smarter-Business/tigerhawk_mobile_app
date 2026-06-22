import type { LoadStatus } from '@/types';

import { tmsApiPath } from './client';
import { TmsStatusChangeError } from './errors';
import { MOCK_LOAD_TRANSITIONS } from '@/lib/loads/constants';

const MOBILE_LOAD_STATUSES = new Set<string>(Object.keys(MOCK_LOAD_TRANSITIONS));

export type LoadTransitionMap = Record<LoadStatus, LoadStatus[]>;

function isLoadStatus(value: string): value is LoadStatus {
  return MOBILE_LOAD_STATUSES.has(value);
}

/** Normalize TMS transition map to mobile-known statuses only. */
export function normalizeLoadTransitionMap(
  raw: Record<string, string[]>,
): LoadTransitionMap {
  const normalized = { ...MOCK_LOAD_TRANSITIONS } as LoadTransitionMap;

  for (const [fromStatus, toStatuses] of Object.entries(raw)) {
    if (!isLoadStatus(fromStatus) || !Array.isArray(toStatuses)) continue;
    normalized[fromStatus] = toStatuses.filter(isLoadStatus);
  }

  return normalized;
}

export async function fetchLoadTransitions(
  accessToken: string,
): Promise<LoadTransitionMap> {
  const url = tmsApiPath('/api/dispatcher/transitions');
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new TmsStatusChangeError(
      'Could not load status transitions.',
      response.status === 401 ? 'UNAUTHORIZED' : 'UNKNOWN',
    );
  }

  const body = (await response.json()) as { transitions?: Record<string, string[]> };
  if (!body.transitions || typeof body.transitions !== 'object') {
    return { ...MOCK_LOAD_TRANSITIONS };
  }

  return normalizeLoadTransitionMap(body.transitions);
}
