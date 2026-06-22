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
  /** Always false after WT.27 — timer starts only via explicit API/mock start. */
  usingFallbackStart: boolean;
};

/** Prefer Supabase `waiting_time_events`; no implicit start from load status (WT.27). */
export function resolveHydratedTimerState(
  events: WaitEventSnapshot[],
  _load: LoadDetail | null,
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

  return {
    startTimeIso: null,
    stoppedAtIso: null,
    eventId: null,
    usingFallbackStart: false,
  };
}
