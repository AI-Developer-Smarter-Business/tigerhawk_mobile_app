import { parseDriverLoadsResponse, parseDriverMoveCard } from '@/lib/tms/parse-driver-loads';

const sampleCard = {
  move_id: 'move-1',
  load_id: 'load-1',
  reference_number: 'THWK_1',
  load_type: 'IMPORT',
  status: 'Dispatched',
  customer: 'Acme',
  container_number: 'TGBU1',
  seal_number: null,
  container_size: '40',
  container_type: 'HC',
  chassis_number: null,
  pickup_location: 'Yard A',
  delivery_location: 'Warehouse B',
  return_location: null,
  is_hazmat: false,
  is_hot: true,
  last_free_day: null,
  per_diem_free_day: null,
  cut_off_date: null,
  accepted_at: null,
  started_at: null,
  assigned_date: '2026-07-15',
  stops: [
    {
      id: 's1',
      event_type: 'pickup_container',
      location: { name: 'BARBOURS CUT' },
      arrived_at: null,
      departed_at: null,
    },
  ],
  progress: {
    label: 'Start Move',
    phase: 'not_started',
    active_move_id: null,
  },
};

describe('parseDriverMoveCard (B.3)', () => {
  it('requires move_id and load_id', () => {
    expect(parseDriverMoveCard({ ...sampleCard, move_id: '' })).toBeNull();
    expect(parseDriverMoveCard({ ...sampleCard, load_id: null })).toBeNull();
  });

  it('parses a valid move card', () => {
    const card = parseDriverMoveCard(sampleCard);
    expect(card?.move_id).toBe('move-1');
    expect(card?.container_number).toBe('TGBU1');
    expect(card?.stops).toHaveLength(1);
    expect(card?.progress.label).toBe('Start Move');
  });
});

describe('parseDriverLoadsResponse (B.3)', () => {
  it('partitions active vs upcoming by started_at (Q14)', () => {
    const result = parseDriverLoadsResponse({
      ok: true,
      active: [{ ...sampleCard, move_id: 'a1', started_at: '2026-07-15T12:00:00Z' }],
      upcoming: [{ ...sampleCard, move_id: 'u1', started_at: null }],
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.buckets.active.map((c) => c.move_id)).toEqual(['a1']);
    expect(result.buckets.upcoming.map((c) => c.move_id)).toEqual(['u1']);
  });

  it('re-partitions if server puts a started card only in upcoming', () => {
    const result = parseDriverLoadsResponse({
      ok: true,
      active: [],
      upcoming: [
        {
          ...sampleCard,
          move_id: 'should-be-active',
          started_at: '2026-07-15T12:00:00Z',
        },
      ],
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.buckets.active.map((c) => c.move_id)).toEqual([
      'should-be-active',
    ]);
    expect(result.buckets.upcoming).toHaveLength(0);
  });
});
