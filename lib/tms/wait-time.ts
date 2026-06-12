import { tmsApiPath } from './client';
import { TmsStatusChangeError, type TmsStatusErrorCode } from './errors';

function waitTimeErrorCode(status: number): TmsStatusErrorCode {
  if (status === 401) return 'UNAUTHORIZED';
  if (status === 403) return 'FORBIDDEN';
  if (status === 404) return 'NOT_FOUND';
  if (status === 400) return 'BAD_REQUEST';
  return 'UNKNOWN';
}

export type WaitTimeEvent = {
  id: string;
  load_id: string;
  event_name: string;
  start_time: string | null;
  end_time: string | null;
  duration_minutes: number | null;
  free_time_minutes: number | null;
  billable: boolean | null;
  charge_amount: number | null;
  driver_pay_amount: number | null;
  location: string | null;
};

export type WaitTimeListResponse = {
  events: WaitTimeEvent[];
  summary: {
    count: number;
    total_minutes: number;
    total_hours: number;
    total_billable: number;
    total_driver_pay: number;
  };
};

export function buildWaitTimePath(loadId: string): string {
  return `/api/dispatcher/loads/${encodeURIComponent(loadId)}/wait-time`;
}

export async function fetchWaitTimeEvents(
  loadId: string,
  accessToken: string,
): Promise<WaitTimeListResponse> {
  const url = tmsApiPath(buildWaitTimePath(loadId));
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}`, Accept: 'application/json' },
  });
  if (!response.ok) {
    throw new TmsStatusChangeError(
      'Could not load wait time data.',
      waitTimeErrorCode(response.status),
    );
  }
  return (await response.json()) as WaitTimeListResponse;
}

export async function startDeliveryWaitEvent(params: {
  loadId: string;
  accessToken: string;
  location?: string | null;
  freeTimeMinutes?: number;
}): Promise<WaitTimeEvent> {
  const url = tmsApiPath(buildWaitTimePath(params.loadId));
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${params.accessToken}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      event_name: 'delivery_wait',
      start_time: new Date().toISOString(),
      location: params.location ?? null,
      free_time_minutes: params.freeTimeMinutes ?? 60,
      logged_by: 'driver',
    }),
  });
  if (!response.ok) {
    let message = 'Could not start delivery wait timer.';
    try {
      const body = (await response.json()) as { error?: string };
      if (body.error) message = body.error;
    } catch {
      // ignore
    }
    throw new TmsStatusChangeError(message, waitTimeErrorCode(response.status));
  }
  return (await response.json()) as WaitTimeEvent;
}

/** Close an open delivery wait event, or record a closed one from fallback start time. */
export async function endOpenDeliveryWaitEvent(params: {
  loadId: string;
  accessToken: string;
  eventId?: string | null;
  startTimeIso?: string | null;
  location?: string | null;
}): Promise<WaitTimeEvent> {
  let eventId = params.eventId ?? null;
  if (!eventId) {
    const data = await fetchWaitTimeEvents(params.loadId, params.accessToken);
    eventId = findOpenDeliveryWaitEvent(data.events)?.id ?? null;
  }

  if (eventId) {
    return stopDeliveryWaitEvent({
      loadId: params.loadId,
      eventId,
      accessToken: params.accessToken,
    });
  }

  if (!params.startTimeIso) {
    throw new TmsStatusChangeError(
      'Could not stop delivery wait timer.',
      'BAD_REQUEST',
    );
  }

  const endTime = new Date().toISOString();
  const url = tmsApiPath(buildWaitTimePath(params.loadId));
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${params.accessToken}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      event_name: 'delivery_wait',
      start_time: params.startTimeIso,
      end_time: endTime,
      location: params.location ?? null,
      logged_by: 'driver',
    }),
  });
  if (!response.ok) {
    let message = 'Could not stop delivery wait timer.';
    try {
      const body = (await response.json()) as { error?: string };
      if (body.error) message = body.error;
    } catch {
      // ignore
    }
    throw new TmsStatusChangeError(message, waitTimeErrorCode(response.status));
  }
  return (await response.json()) as WaitTimeEvent;
}

export async function stopDeliveryWaitEvent(params: {
  loadId: string;
  eventId: string;
  accessToken: string;
}): Promise<WaitTimeEvent> {
  const url = tmsApiPath(buildWaitTimePath(params.loadId));
  const endTime = new Date().toISOString();
  const response = await fetch(url, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${params.accessToken}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      event_id: params.eventId,
      end_time: endTime,
    }),
  });
  if (!response.ok) {
    throw new TmsStatusChangeError(
      'Could not stop delivery wait timer.',
      waitTimeErrorCode(response.status),
    );
  }
  return (await response.json()) as WaitTimeEvent;
}

export async function syncOpenDeliveryWaitDuration(params: {
  loadId: string;
  eventId: string;
  accessToken: string;
  startTimeIso: string;
}): Promise<WaitTimeEvent> {
  const durationMinutes = Math.max(
    0,
    Math.round((Date.now() - new Date(params.startTimeIso).getTime()) / 60_000),
  );
  const url = tmsApiPath(buildWaitTimePath(params.loadId));
  const response = await fetch(url, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${params.accessToken}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      event_id: params.eventId,
      duration_minutes: durationMinutes,
    }),
  });
  if (!response.ok) {
    throw new TmsStatusChangeError(
      'Could not sync wait time.',
      waitTimeErrorCode(response.status),
    );
  }
  return (await response.json()) as WaitTimeEvent;
}

export function findOpenDeliveryWaitEvent(
  events: WaitTimeEvent[],
): WaitTimeEvent | null {
  return (
    events.find(
      (event) =>
        event.event_name === 'delivery_wait' &&
        event.start_time &&
        !event.end_time,
    ) ?? null
  );
}
