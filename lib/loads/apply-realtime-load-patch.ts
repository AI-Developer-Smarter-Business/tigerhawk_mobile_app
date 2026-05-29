import type { InfiniteData } from '@tanstack/react-query';

import { getActiveHoldKeysFromLoad } from '@/lib/loads/active-holds';
import type { DriverLoadsPageResult } from '@/lib/supabase/queries/loads';
import type { LoadDetail, LoadStatus } from '@/types';

const HOLD_COLUMNS = [
  'freight_hold',
  'customs_hold',
  'terminal_hold',
  'fees_hold',
  'other_hold',
  'carrier_hold',
] as const;

export function rowHasHoldOrStatusPatch(row: Record<string, unknown>): boolean {
  return (
    row.status !== undefined ||
    HOLD_COLUMNS.some((col) => row[col] !== undefined)
  );
}

/** Patch `active_holds` when Realtime sends only changed hold columns. */
export function patchActiveHoldsFromRealtime(
  currentActiveHolds: string[],
  row: Record<string, unknown>,
): string[] {
  let next = [...currentActiveHolds];

  for (const col of HOLD_COLUMNS) {
    if (row[col] === undefined) {
      continue;
    }
    const isActive =
      col === 'carrier_hold' ? row[col] === true : row[col] === 'hold';
    if (isActive) {
      if (!next.includes(col)) {
        next.push(col);
      }
    } else {
      next = next.filter((key) => key !== col);
    }
  }

  return next;
}

export function patchLoadDetailFromRealtimeRow(
  current: LoadDetail | null | undefined,
  row: Record<string, unknown>,
): LoadDetail | null | undefined {
  if (!current) {
    return current;
  }

  let next: LoadDetail = { ...current };

  if (typeof row.status === 'string') {
    next = { ...next, status: row.status as LoadStatus };
  }

  if (rowHasHoldOrStatusPatch(row)) {
    const active_holds = patchActiveHoldsFromRealtime(current.active_holds, row);
    next = { ...next, active_holds };
  }

  if (typeof row.is_hot === 'boolean') {
    next = { ...next, is_hot: row.is_hot };
  }

  if (typeof row.pickup_location === 'string' || row.pickup_location === null) {
    next = { ...next, pickup_location: row.pickup_location as string | null };
  }
  if (typeof row.delivery_location === 'string' || row.delivery_location === null) {
    next = { ...next, delivery_location: row.delivery_location as string | null };
  }

  return next;
}

/** Full hold row from Realtime (all columns present) — recompute holds from scratch. */
export function activeHoldsFromFullRealtimeRow(
  row: Record<string, unknown>,
): string[] | null {
  const hasAll = HOLD_COLUMNS.every((col) => row[col] !== undefined);
  if (!hasAll) {
    return null;
  }
  return getActiveHoldKeysFromLoad({
    freight_hold: row.freight_hold as string | null,
    customs_hold: row.customs_hold as string | null,
    terminal_hold: row.terminal_hold as string | null,
    fees_hold: row.fees_hold as string | null,
    other_hold: row.other_hold as string | null,
    carrier_hold: row.carrier_hold as boolean | null,
  });
}

export function patchLoadDetailFromRealtimeRowWithFullHolds(
  current: LoadDetail | null | undefined,
  row: Record<string, unknown>,
): LoadDetail | null | undefined {
  const patched = patchLoadDetailFromRealtimeRow(current, row);
  if (!patched) {
    return patched;
  }
  const fullHolds = activeHoldsFromFullRealtimeRow(row);
  if (fullHolds) {
    return { ...patched, active_holds: fullHolds };
  }
  return patched;
}

export function patchDriverLoadsInfiniteData(
  data: InfiniteData<DriverLoadsPageResult> | undefined,
  loadId: string,
  row: Record<string, unknown>,
): InfiniteData<DriverLoadsPageResult> | undefined {
  if (!data) {
    return data;
  }

  return {
    ...data,
    pages: data.pages.map((page) => ({
      ...page,
      loads: page.loads.map((load) =>
        load.id === loadId
          ? (patchLoadDetailFromRealtimeRowWithFullHolds(load, row) ?? load)
          : load,
      ),
    })),
  };
}
