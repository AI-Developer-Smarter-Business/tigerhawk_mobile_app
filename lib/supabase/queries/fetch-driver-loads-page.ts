import type { SupabaseClient } from '@supabase/supabase-js';

import { LOAD_LIST_PAGE_SIZE } from '@/lib/supabase/schema/driver-loads';

import {
  hasMoreDriverLoads,
  mapLoadRowsToDetails,
  type LoadListRow,
} from './map-load-row';
import { LOAD_LIST_SELECT } from './load-query-select';
import type { DriverLoadsPageResult, FetchDriverLoadsPageOptions } from './loads';

/** Preserve list order from the id page (PostgREST `.in()` order is undefined). */
export function orderLoadListRowsByIds(
  ids: string[],
  rows: LoadListRow[],
): LoadListRow[] {
  const byId = new Map<string, LoadListRow>();
  for (const row of rows) {
    if (!byId.has(row.id)) {
      byId.set(row.id, row);
    }
  }
  return ids
    .map((id) => byId.get(id))
    .filter((row): row is LoadListRow => row != null);
}

/**
 * Paginates by load id first, then fetches embeds — avoids PostgREST row fan-out
 * (multiple `containers` rows per load) breaking range/scroll and causing UI lag.
 */
export async function fetchDriverLoadsPageImpl(
  supabase: SupabaseClient,
  driverUserId: string,
  options: FetchDriverLoadsPageOptions = {},
): Promise<DriverLoadsPageResult> {
  const page = Math.max(0, options.page ?? 0);
  const pageSize = options.pageSize ?? LOAD_LIST_PAGE_SIZE;
  const from = page * pageSize;
  const to = from + pageSize - 1;

  const {
    data: idRows,
    error: idError,
    count,
  } = await supabase
    .from('loads')
    .select('id', { count: 'exact' })
    .eq('driver_id', driverUserId)
    .order('created_at', { ascending: false })
    .range(from, to);

  if (idError) {
    return {
      loads: [],
      errorMessage: idError.message,
      hasMore: false,
      totalCount: null,
      page,
      pageSize,
    };
  }

  const ids = (idRows ?? []).map((row) => row.id as string);
  if (ids.length === 0) {
    const totalCount = count ?? 0;
    return {
      loads: [],
      errorMessage: null,
      hasMore: false,
      totalCount,
      page,
      pageSize,
    };
  }

  const { data: embedRows, error: embedError } = await supabase
    .from('loads')
    .select(LOAD_LIST_SELECT)
    .in('id', ids);

  if (embedError) {
    return {
      loads: [],
      errorMessage: embedError.message,
      hasMore: false,
      totalCount: count ?? null,
      page,
      pageSize,
    };
  }

  const ordered = orderLoadListRowsByIds(
    ids,
    (embedRows ?? []) as unknown as LoadListRow[],
  );
  const loads = mapLoadRowsToDetails(ordered);
  const totalCount = count ?? null;

  return {
    loads,
    errorMessage: null,
    hasMore: hasMoreDriverLoads({
      page,
      pageSize,
      rowCount: ids.length,
      totalCount,
    }),
    totalCount,
    page,
    pageSize,
  };
}
