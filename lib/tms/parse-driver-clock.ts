export type DriverClockState = {
  driverId: string;
  driverName: string | null;
  isClockedIn: boolean;
  status: string | null;
  lastClockInAt: string | null;
  lastClockOutAt: string | null;
};

export type DriverClockMutationResult = {
  driverId: string;
  driverName: string | null;
  event: 'in' | 'out';
  isClockedIn: boolean;
  status: string | null;
  previousStatus: string | null;
  occurredAt: string | null;
};

function asTrimmedString(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function asBoolean(value: unknown): boolean | null {
  if (typeof value === 'boolean') return value;
  return null;
}

/** Parse GET `/api/mobile/driver/clock` body. */
export function parseDriverClockGetResponse(
  body: unknown,
): { ok: true; state: DriverClockState } | { ok: false; error: string } {
  if (!body || typeof body !== 'object') {
    return { ok: false, error: 'Clock response was incomplete.' };
  }
  const row = body as Record<string, unknown>;
  if (row.ok !== true) {
    return { ok: false, error: 'Clock response was incomplete.' };
  }

  const driverId = asTrimmedString(row.driver_id ?? row.driverId);
  const isClockedIn = asBoolean(row.is_clocked_in ?? row.isClockedIn);
  if (!driverId || isClockedIn == null) {
    return { ok: false, error: 'Clock response was incomplete.' };
  }

  return {
    ok: true,
    state: {
      driverId,
      driverName: asTrimmedString(row.driver_name ?? row.driverName),
      isClockedIn,
      status: asTrimmedString(row.status),
      lastClockInAt: asTrimmedString(
        row.last_clock_in_at ?? row.lastClockInAt,
      ),
      lastClockOutAt: asTrimmedString(
        row.last_clock_out_at ?? row.lastClockOutAt,
      ),
    },
  };
}

/** Parse POST `/api/mobile/driver/clock` body. */
export function parseDriverClockPostResponse(
  body: unknown,
):
  | { ok: true; result: DriverClockMutationResult }
  | { ok: false; error: string } {
  if (!body || typeof body !== 'object') {
    return { ok: false, error: 'Clock response was incomplete.' };
  }
  const row = body as Record<string, unknown>;
  if (row.ok !== true) {
    return { ok: false, error: 'Clock response was incomplete.' };
  }

  const driverId = asTrimmedString(row.driver_id ?? row.driverId);
  const eventRaw = asTrimmedString(row.event);
  const event =
    eventRaw === 'in' || eventRaw === 'out' ? eventRaw : null;
  const isClockedIn = asBoolean(row.is_clocked_in ?? row.isClockedIn);
  if (!driverId || !event || isClockedIn == null) {
    return { ok: false, error: 'Clock response was incomplete.' };
  }

  return {
    ok: true,
    result: {
      driverId,
      driverName: asTrimmedString(row.driver_name ?? row.driverName),
      event,
      isClockedIn,
      status: asTrimmedString(row.status),
      previousStatus: asTrimmedString(
        row.previous_status ?? row.previousStatus,
      ),
      occurredAt: asTrimmedString(row.occurred_at ?? row.occurredAt),
    },
  };
}
