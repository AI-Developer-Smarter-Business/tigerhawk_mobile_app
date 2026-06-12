import { resolveFallbackWaitStartIso } from './resolve-timer-start';
import type { LoadDetail } from '@/types';

export type WaitEventSnapshot = {
  id: string;
  event_name: string;
  start_time: string | null;
  end_time: string | null;
};

function findOpenDeliveryWaitEvent(
  events: WaitEventSnapshot[],
): WaitEventSnapshot | null {
  return (
    events.find(
      (event) =>
        event.event_name === 'delivery_wait' &&
        event.start_time &&
        !event.end_time,
    ) ?? null
  );
}

export type HydratedTimerState = {
  startTimeIso: string | null;
  stoppedAtIso: string | null;
  eventId: string | null;
  /** True when UI time comes from load.actual_delivery, not waiting_time_events. */
  usingFallbackStart: boolean;
};

/** Prefer Supabase `waiting_time_events`; fallback only when no event exists. */
export function resolveHydratedTimerState(
  events: WaitEventSnapshot[],
  load: LoadDetail | null,
): HydratedTimerState {
  const open = findOpenDeliveryWaitEvent(events);
  if (open?.start_time) {
    return {
      startTimeIso: open.start_time,
      stoppedAtIso: open.end_time,
      eventId: open.id,
      usingFallbackStart: false,
    };
  }

  const lastDelivery = events.find((event) => event.event_name === 'delivery_wait');
  if (lastDelivery?.start_time) {
    return {
      startTimeIso: lastDelivery.start_time,
      stoppedAtIso: lastDelivery.end_time,
      eventId: lastDelivery.id,
      usingFallbackStart: false,
    };
  }

  const fallback = resolveFallbackWaitStartIso(load);
  return {
    startTimeIso: fallback,
    stoppedAtIso: null,
    eventId: null,
    usingFallbackStart: Boolean(fallback),
  };
}
