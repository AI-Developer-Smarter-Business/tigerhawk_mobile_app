import { QueryClient } from '@tanstack/react-query';

import {
  findCachedDriverMoveCard,
  findDriverMoveCardInBuckets,
} from '../find-cached-driver-move-card';
import type { DriverMoveCard } from '../driver-move-card';
import { queryKeys } from '@/lib/query/query-keys';

function card(overrides: Partial<DriverMoveCard> = {}): DriverMoveCard {
  return {
    move_id: 'move-1',
    load_id: 'load-1',
    reference_number: 'THWK_1',
    load_type: null,
    status: 'Dispatched',
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
    accepted_at: null,
    started_at: null,
    assigned_date: null,
    stops: [],
    progress: { label: '', phase: '', active_move_id: null },
    ...overrides,
  };
}

describe('findCachedDriverMoveCard', () => {
  it('prefers the exact move from Active/Upcoming buckets', () => {
    const queryClient = new QueryClient();
    const preferred = card({ move_id: 'move-2', load_id: 'load-9' });
    queryClient.setQueryData(queryKeys.loads.mobileBuckets('driver-1'), {
      active: [card({ move_id: 'move-1', load_id: 'load-9' })],
      upcoming: [preferred],
    });

    expect(
      findCachedDriverMoveCard(queryClient, 'driver-1', 'load-9', 'move-2')
        ?.move_id,
    ).toBe('move-2');
  });

  it('falls back to history cache', () => {
    const queryClient = new QueryClient();
    queryClient.setQueryData(
      queryKeys.loads.mobileHistory('driver-1', '2026-07-01', '2026-07-17', ''),
      [card({ move_id: 'move-h', load_id: 'load-h' })],
    );

    expect(
      findCachedDriverMoveCard(queryClient, 'driver-1', 'load-h')?.move_id,
    ).toBe('move-h');
  });
});

describe('findDriverMoveCardInBuckets', () => {
  it('returns null when the load is absent', () => {
    expect(
      findDriverMoveCardInBuckets(
        { active: [card()], upcoming: [] },
        'missing',
      ),
    ).toBeNull();
  });
});
