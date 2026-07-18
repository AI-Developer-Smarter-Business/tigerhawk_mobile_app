import type {
  DriverLoadsBuckets,
  DriverMoveCard,
} from '@/lib/loads/driver-move-card';

/**
 * Q14 partition (server already skips finished loads):
 * - Active   = `started_at` set
 * - Upcoming = assigned move not started (accepted or not)
 * - No "today" filter
 *
 * Pure helper so the UI matches TMS even before B.3 wires the HTTP client,
 * and so unit tests lock the rule without a network.
 */
export function partitionDriverMoveCards(
  cards: readonly DriverMoveCard[],
): DriverLoadsBuckets {
  const active: DriverMoveCard[] = [];
  const upcoming: DriverMoveCard[] = [];

  for (const card of cards) {
    if (card.started_at) {
      active.push(card);
    } else {
      upcoming.push(card);
    }
  }

  return { active, upcoming };
}

export function emptyDriverLoadsBuckets(): DriverLoadsBuckets {
  return { active: [], upcoming: [] };
}
