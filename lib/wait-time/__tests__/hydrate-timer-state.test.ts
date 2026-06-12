import { resolveHydratedTimerState, type WaitEventSnapshot } from '../hydrate-timer-state';
import type { LoadDetail } from '@/types';

const baseLoad = {
  id: 'load-1',
  status: 'Arrived At Delivery',
  actual_delivery: '2026-06-11T14:43:00Z',
} as LoadDetail;

describe('resolveHydratedTimerState', () => {
  it('prefers open delivery_wait event over fallback', () => {
    const events: WaitEventSnapshot[] = [
      {
        id: 'evt-1',
        load_id: 'load-1',
        event_name: 'delivery_wait',
        start_time: '2026-06-11T14:50:00Z',
        end_time: null,
      },
    ];

    const state = resolveHydratedTimerState(events, baseLoad);
    expect(state.startTimeIso).toBe('2026-06-11T14:50:00Z');
    expect(state.eventId).toBe('evt-1');
    expect(state.usingFallbackStart).toBe(false);
  });

  it('uses closed event when no open event exists', () => {
    const events: WaitEventSnapshot[] = [
      {
        id: 'evt-closed',
        event_name: 'delivery_wait',
        start_time: '2026-06-11T14:50:00Z',
        end_time: '2026-06-11T15:20:00Z',
      },
    ];

    const state = resolveHydratedTimerState(events, baseLoad);
    expect(state.stoppedAtIso).toBe('2026-06-11T15:20:00Z');
    expect(state.usingFallbackStart).toBe(false);
  });

  it('falls back to actual_delivery only when API has no events', () => {
    const state = resolveHydratedTimerState([], baseLoad);
    expect(state.startTimeIso).toBe('2026-06-11T14:43:00Z');
    expect(state.eventId).toBeNull();
    expect(state.usingFallbackStart).toBe(true);
  });
});
