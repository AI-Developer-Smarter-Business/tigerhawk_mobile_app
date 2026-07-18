import type { QueryClient } from '@tanstack/react-query';

import type {
  DriverLoadsBuckets,
  DriverMoveCard,
} from '@/lib/loads/driver-move-card';
import { queryKeys } from '@/lib/query/query-keys';

function pickMoveCard(
  cards: DriverMoveCard[],
  loadId: string,
  preferredMoveId?: string,
): DriverMoveCard | null {
  const forLoad = cards.filter((card) => card.load_id === loadId);
  if (forLoad.length === 0) return null;
  if (preferredMoveId) {
    const preferred = forLoad.find((card) => card.move_id === preferredMoveId);
    if (preferred) return preferred;
  }
  return forLoad[0] ?? null;
}

/**
 * Finds a move card already cached from Active/Upcoming or Load History.
 */
export function findCachedDriverMoveCard(
  queryClient: QueryClient,
  driverId: string,
  loadId: string,
  preferredMoveId?: string,
): DriverMoveCard | null {
  if (!driverId || !loadId) return null;

  const buckets = queryClient.getQueryData<DriverLoadsBuckets>(
    queryKeys.loads.mobileBuckets(driverId),
  );
  const fromBuckets = pickMoveCard(
    [...(buckets?.active ?? []), ...(buckets?.upcoming ?? [])],
    loadId,
    preferredMoveId,
  );
  if (fromBuckets) return fromBuckets;

  const historyEntries = queryClient.getQueriesData<DriverMoveCard[]>({
    queryKey: [...queryKeys.loads.all(driverId), 'mobile-history'],
  });

  for (const [, history] of historyEntries) {
    if (!Array.isArray(history)) continue;
    const fromHistory = pickMoveCard(history, loadId, preferredMoveId);
    if (fromHistory) return fromHistory;
  }

  return null;
}

export function findDriverMoveCardInBuckets(
  buckets: DriverLoadsBuckets,
  loadId: string,
  preferredMoveId?: string,
): DriverMoveCard | null {
  return pickMoveCard(
    [...buckets.active, ...buckets.upcoming],
    loadId,
    preferredMoveId,
  );
}
