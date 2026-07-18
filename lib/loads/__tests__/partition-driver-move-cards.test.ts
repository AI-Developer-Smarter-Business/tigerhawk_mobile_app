import {
  emptyDriverLoadsBuckets,
  partitionDriverMoveCards,
} from '@/lib/loads/partition-driver-move-cards';
import type { DriverMoveCard } from '@/lib/loads/driver-move-card';

function card(
  partial: Pick<DriverMoveCard, 'move_id' | 'started_at'> &
    Partial<DriverMoveCard>,
): DriverMoveCard {
  return {
    move_id: partial.move_id,
    load_id: partial.load_id ?? 'load-1',
    reference_number: partial.reference_number ?? 'THWK_1',
    load_type: null,
    status: partial.status ?? 'Dispatched',
    customer: null,
    container_number: null,
    seal_number: null,
    container_size: null,
    container_type: null,
    chassis_number: null,
    pickup_location: null,
    delivery_location: null,
    return_location: null,
    is_hazmat: false,
    is_hot: false,
    last_free_day: null,
    per_diem_free_day: null,
    cut_off_date: null,
    accepted_at: partial.accepted_at ?? null,
    started_at: partial.started_at,
    assigned_date: null,
    stops: [],
    progress: partial.progress ?? {
      label: 'Start Move',
      phase: 'idle',
      active_move_id: null,
    },
  };
}

describe('partitionDriverMoveCards (B.1 · Q14)', () => {
  it('puts started moves in Active and the rest in Upcoming', () => {
    const buckets = partitionDriverMoveCards([
      card({ move_id: 'm-active', started_at: '2026-07-15T12:00:00Z' }),
      card({ move_id: 'm-upcoming', started_at: null }),
      card({
        move_id: 'm-accepted',
        started_at: null,
        accepted_at: '2026-07-15T11:00:00Z',
      }),
    ]);

    expect(buckets.active.map((c) => c.move_id)).toEqual(['m-active']);
    expect(buckets.upcoming.map((c) => c.move_id)).toEqual([
      'm-upcoming',
      'm-accepted',
    ]);
  });

  it('does not apply a today-only filter', () => {
    const buckets = partitionDriverMoveCards([
      card({
        move_id: 'tomorrow',
        started_at: null,
        assigned_date: '2099-01-01',
      }),
    ]);
    expect(buckets.upcoming).toHaveLength(1);
    expect(buckets.active).toHaveLength(0);
  });

  it('emptyDriverLoadsBuckets returns both lists empty', () => {
    expect(emptyDriverLoadsBuckets()).toEqual({ active: [], upcoming: [] });
  });
});
