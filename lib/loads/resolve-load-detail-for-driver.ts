import type { QueryClient } from '@tanstack/react-query';
import type { SupabaseClient } from '@supabase/supabase-js';

import {
  findCachedDriverMoveCard,
  findDriverMoveCardInBuckets,
} from '@/lib/loads/find-cached-driver-move-card';
import { mapDriverMoveCardToLoadDetail } from '@/lib/loads/map-driver-move-card-to-load-detail';
import { queryKeys } from '@/lib/query/query-keys';
import { fetchLoadDetailForDriver } from '@/lib/supabase/queries/loads';
import { fetchMobileDriverLoads } from '@/lib/tms/fetch-driver-loads';
import type { LoadDetail } from '@/types';

export type ResolveLoadDetailForDriverParams = {
  supabase: SupabaseClient;
  queryClient: QueryClient;
  loadId: string;
  driverId: string;
  moveId?: string;
  accessToken?: string;
};

export type ResolveLoadDetailForDriverResult = {
  load: LoadDetail | null;
  errorMessage: string | null;
  notFound: boolean;
  /** True when detail came from a mobile move card (not Supabase loads.driver_id). */
  fromMoveCard: boolean;
};

/**
 * Load detail for the signed-in driver.
 *
 * Prefer Supabase when `loads.driver_id` matches. Otherwise fall back to the
 * move card already returned by `GET /api/mobile/driver/loads` (Q14 assignment).
 */
export async function resolveLoadDetailForDriver(
  params: ResolveLoadDetailForDriverParams,
): Promise<ResolveLoadDetailForDriverResult> {
  const supabaseResult = await fetchLoadDetailForDriver(
    params.supabase,
    params.loadId,
    params.driverId,
  );

  if (supabaseResult.errorMessage) {
    return {
      load: null,
      errorMessage: supabaseResult.errorMessage,
      notFound: false,
      fromMoveCard: false,
    };
  }

  if (supabaseResult.load) {
    return {
      load: supabaseResult.load,
      errorMessage: null,
      notFound: false,
      fromMoveCard: false,
    };
  }

  const cachedCard = findCachedDriverMoveCard(
    params.queryClient,
    params.driverId,
    params.loadId,
    params.moveId,
  );
  if (cachedCard) {
    return {
      load: mapDriverMoveCardToLoadDetail(cachedCard),
      errorMessage: null,
      notFound: false,
      fromMoveCard: true,
    };
  }

  const mobileLoads = await fetchMobileDriverLoads({
    accessToken: params.accessToken,
  });
  if (!mobileLoads.ok) {
    return {
      load: null,
      errorMessage: mobileLoads.error,
      notFound: false,
      fromMoveCard: false,
    };
  }

  const freshCard = findDriverMoveCardInBuckets(
    mobileLoads.buckets,
    params.loadId,
    params.moveId,
  );
  if (freshCard) {
    params.queryClient.setQueryData(
      queryKeys.loads.mobileBuckets(params.driverId),
      mobileLoads.buckets,
    );
    return {
      load: mapDriverMoveCardToLoadDetail(freshCard),
      errorMessage: null,
      notFound: false,
      fromMoveCard: true,
    };
  }

  return {
    load: null,
    errorMessage: null,
    notFound: true,
    fromMoveCard: false,
  };
}
