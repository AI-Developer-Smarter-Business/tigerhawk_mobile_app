import { formatHoldLabel } from '@/lib/loads/active-holds';

import { TmsStatusChangeError } from './errors';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readStringArray(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const items = value.filter((item): item is string => typeof item === 'string');
  return items.length > 0 ? items : undefined;
}

/** Maps TMS status PATCH HTTP status + JSON body to a typed client error. */
export function parseStatusPatchError(
  httpStatus: number,
  body: unknown,
): TmsStatusChangeError {
  const data = isRecord(body) ? body : {};
  const error =
    typeof data.error === 'string' ? data.error : undefined;
  const code = typeof data.code === 'string' ? data.code : undefined;
  const activeHolds = readStringArray(data.activeHolds);
  const validNextStates = readStringArray(data.validNextStates);

  if (httpStatus === 401) {
    return new TmsStatusChangeError(
      error ?? 'Session expired. Sign in again.',
      'UNAUTHORIZED',
    );
  }

  if (httpStatus === 403 && code === 'ACTIVE_HOLDS') {
    const holdLabels = activeHolds?.map((key) => formatHoldLabel(key)) ?? [];
    const holdsSuffix = holdLabels.length ? ` (${holdLabels.join(', ')})` : '';
    return new TmsStatusChangeError(
      `${error ?? 'Cannot change status while active holds are set.'}${holdsSuffix}`,
      'ACTIVE_HOLDS',
      { activeHolds },
    );
  }

  if (httpStatus === 403) {
    return new TmsStatusChangeError(
      error ?? "You don't have permission to update this load status.",
      'FORBIDDEN',
    );
  }

  if (httpStatus === 404) {
    return new TmsStatusChangeError(error ?? 'Load not found.', 'NOT_FOUND');
  }

  if (httpStatus === 400) {
    return new TmsStatusChangeError(
      error ?? 'Invalid status transition.',
      'INVALID_TRANSITION',
      { validNextStates },
    );
  }

  if (httpStatus >= 400 && httpStatus < 500) {
    return new TmsStatusChangeError(
      error ?? 'Request could not be processed.',
      'BAD_REQUEST',
    );
  }

  return new TmsStatusChangeError(
    error ?? 'Failed to update status.',
    'UNKNOWN',
  );
}
