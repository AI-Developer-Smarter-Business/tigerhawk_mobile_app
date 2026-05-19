import type { SupabaseClient } from '@supabase/supabase-js';

import { LOAD_LIST_PAGE_SIZE } from '@/lib/supabase/schema/driver-loads';
import type { LoadDetail } from '@/types';

import {
  hasMoreDriverLoads,
  mapLoadDetailRowToDetail,
  mapLoadRowsToDetails,
  type LoadDetailRow,
  type LoadListRow,
} from './map-load-row';

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

/** Aligned to `docs/LOADS_DATA_MAP.md` — container_number on `containers`, not `loads`. */
export const LOAD_LIST_SELECT = `
  id,
  reference_number,
  status,
  pickup_location,
  delivery_location,
  return_location,
  pickup_apt_from,
  pickup_apt_to,
  delivery_apt_from,
  delivery_apt_to,
  is_hot,
  notes,
  freight_hold,
  customs_hold,
  terminal_hold,
  fees_hold,
  other_hold,
  carrier_hold,
  created_at,
  containers ( container_number ),
  customers ( name )
`;

/** Detail master data — see `docs/LOADS_DATA_MAP.md` §2.2 and `docs/DISPATCHER_API_ROUTES.md`. */
export const LOAD_DETAIL_SELECT = `
  id,
  reference_number,
  status,
  pickup_location,
  delivery_location,
  return_location,
  pickup_apt_from,
  pickup_apt_to,
  delivery_apt_from,
  delivery_apt_to,
  is_hot,
  notes,
  load_type,
  route_type,
  ssl,
  mbol,
  house_bol,
  seal_number,
  chassis_number,
  container_size,
  scheduled_pickup,
  actual_pickup,
  actual_delivery,
  completed_date,
  created_at,
  is_hazmat,
  is_overweight,
  is_bonded,
  freight_hold,
  customs_hold,
  terminal_hold,
  fees_hold,
  other_hold,
  carrier_hold,
  containers (
    container_number,
    bol_number,
    size,
    type,
    seal_number
  ),
  customers (
    name,
    phone,
    address,
    city,
    state,
    zip_code
  ),
  drivers ( name, phone )
`;

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
  const page = Math.max(0, options.page ?? 0);
  const pageSize = options.pageSize ?? LOAD_LIST_PAGE_SIZE;
  const from = page * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await supabase
    .from('loads')
    .select(LOAD_LIST_SELECT, { count: 'exact' })
    .eq('driver_id', driverUserId)
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) {
    return {
      loads: [],
      errorMessage: error.message,
      hasMore: false,
      totalCount: null,
      page,
      pageSize,
    };
  }

  const rawRows = (data ?? []) as unknown as LoadListRow[];
  const loads = mapLoadRowsToDetails(rawRows);
  const totalCount = count ?? null;

  return {
    loads,
    errorMessage: null,
    hasMore: hasMoreDriverLoads({
      page,
      pageSize,
      rowCount: loads.length,
      totalCount,
    }),
    totalCount,
    page,
    pageSize,
  };
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
