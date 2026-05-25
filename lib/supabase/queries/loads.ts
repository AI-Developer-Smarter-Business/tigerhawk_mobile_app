import type { SupabaseClient } from '@supabase/supabase-js';

import { assertOnlineForFetch } from '@/lib/network/assert-online';
import { LOAD_LIST_PAGE_SIZE } from '@/lib/supabase/schema/driver-loads';
import type { LoadDetail } from '@/types';

import { fetchDriverLoadsPageImpl } from './fetch-driver-loads-page';
import { LOAD_DETAIL_SELECT, LOAD_LIST_SELECT } from './load-query-select';
import {
  mapLoadDetailRowToDetail,
  type LoadDetailRow,
} from './map-load-row';

export { LOAD_DETAIL_SELECT, LOAD_LIST_SELECT } from './load-query-select';

export type LoadsQueryResult = {
  loads: LoadDetail[];
  errorMessage: string | null;
};

export type LoadDetailQueryResult = {
  load: LoadDetail | null;
  errorMessage: string | null;
  notFound: boolean;
};

export type DriverLoadsPageResult = LoadsQueryResult & {
  hasMore: boolean;
  totalCount: number | null;
  page: number;
  pageSize: number;
};

export type FetchDriverLoadsPageOptions = {
  page?: number;
  pageSize?: number;
};

/**
 * Paginated assigned loads for the signed-in driver (RLS + `driver_id` filter).
 */
export async function fetchDriverLoadsPage(
  supabase: SupabaseClient,
  driverUserId: string,
  options: FetchDriverLoadsPageOptions = {},
): Promise<DriverLoadsPageResult> {
  return fetchDriverLoadsPageImpl(supabase, driverUserId, options);
}

/** First page only — convenience for callers that do not paginate. */
export async function fetchLoadsForDriver(
  supabase: SupabaseClient,
  driverUserId: string,
  limit = LOAD_LIST_PAGE_SIZE,
): Promise<LoadsQueryResult> {
  const result = await fetchDriverLoadsPage(supabase, driverUserId, {
    page: 0,
    pageSize: limit,
  });
  return { loads: result.loads, errorMessage: result.errorMessage };
}

/**
 * Single load detail for the signed-in driver (RLS + `driver_id` filter).
 */
export async function fetchLoadDetailForDriver(
  supabase: SupabaseClient,
  loadId: string,
  driverUserId: string,
): Promise<LoadDetailQueryResult> {
  await assertOnlineForFetch();

  const { data, error } = await supabase
    .from('loads')
    .select(LOAD_DETAIL_SELECT)
    .eq('id', loadId)
    .eq('driver_id', driverUserId)
    .maybeSingle();

  if (error) {
    return { load: null, errorMessage: error.message, notFound: false };
  }

  if (!data) {
    return { load: null, errorMessage: null, notFound: true };
  }

  const load = mapLoadDetailRowToDetail(data as unknown as LoadDetailRow);
  return { load, errorMessage: null, notFound: false };
}
