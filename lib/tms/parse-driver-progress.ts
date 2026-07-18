import {
  DRIVER_PROGRESS_PHASES,
  type DriverLoadProgress,
  type DriverProgressPhase,
  type DriverProgressStop,
} from '@/lib/loads/driver-progress';

type ParseDriverProgressResult =
  | { ok: true; progress: DriverLoadProgress }
  | { ok: false; error: string };

const PHASES = new Set<string>(DRIVER_PROGRESS_PHASES);

function asObject(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === 'object'
    ? (value as Record<string, unknown>)
    : null;
}

function asString(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function asNullableString(value: unknown): string | null {
  return value == null ? null : asString(value);
}

function isNullableString(value: unknown): boolean {
  return value == null || asString(value) != null;
}

function hasOwn(object: Record<string, unknown>, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(object, key);
}

function parseStop(value: unknown): DriverProgressStop | null {
  const stop = asObject(value);
  if (!stop) return null;

  const id = asString(stop.id);
  const eventType = asString(stop.event_type);
  const sortOrder = stop.sort_order;
  if (
    !id ||
    !eventType ||
    !Number.isInteger(sortOrder) ||
    !hasOwn(stop, 'started_at') ||
    !hasOwn(stop, 'arrived_at') ||
    !hasOwn(stop, 'departed_at') ||
    !isNullableString(stop.started_at) ||
    !isNullableString(stop.arrived_at) ||
    !isNullableString(stop.departed_at)
  ) {
    return null;
  }

  return {
    id,
    event_type: eventType,
    sort_order: sortOrder as number,
    started_at: asNullableString(stop.started_at),
    arrived_at: asNullableString(stop.arrived_at),
    departed_at: asNullableString(stop.departed_at),
    location: stop.location ?? null,
  };
}

function parseNullableStop(
  value: unknown,
): { valid: true; stop: DriverProgressStop | null } | { valid: false } {
  if (value == null) return { valid: true, stop: null };
  const stop = parseStop(value);
  return stop ? { valid: true, stop } : { valid: false };
}

/** Parses `{ ok:true, progress }` from both GET and POST `/progress`. */
export function parseDriverProgressResponse(
  body: unknown,
): ParseDriverProgressResult {
  const root = asObject(body);
  const raw = asObject(root?.progress);
  if (root?.ok !== true || !raw) {
    return { ok: false, error: 'Move progress response was incomplete.' };
  }

  const phase = asString(raw.phase);
  const label = asString(raw.label);
  const status = asString(raw.status);
  const currentStop = parseNullableStop(raw.currentStop);
  const nextStop = parseNullableStop(raw.nextStop);
  const activeMoveIndex = raw.activeMoveIndex;
  const containerEmpty = raw.containerEmpty;

  if (
    ![
      'activeMoveId',
      'activeMoveIndex',
      'currentStop',
      'nextStop',
      'allMovesComplete',
      'nextUnassignedMoveId',
      'containerEmpty',
    ].every((key) => hasOwn(raw, key)) ||
    !phase ||
    !PHASES.has(phase) ||
    !label ||
    !status ||
    !currentStop.valid ||
    !nextStop.valid ||
    !isNullableString(raw.activeMoveId) ||
    !isNullableString(raw.nextUnassignedMoveId) ||
    typeof raw.allMovesComplete !== 'boolean' ||
    !(
      activeMoveIndex == null ||
      (Number.isInteger(activeMoveIndex) && (activeMoveIndex as number) >= 0)
    ) ||
    !(containerEmpty == null || typeof containerEmpty === 'boolean')
  ) {
    return { ok: false, error: 'Move progress response was incomplete.' };
  }

  return {
    ok: true,
    progress: {
      phase: phase as DriverProgressPhase,
      label,
      activeMoveId: asNullableString(raw.activeMoveId),
      activeMoveIndex:
        activeMoveIndex == null ? null : (activeMoveIndex as number),
      currentStop: currentStop.stop,
      nextStop: nextStop.stop,
      allMovesComplete: raw.allMovesComplete,
      nextUnassignedMoveId: asNullableString(raw.nextUnassignedMoveId),
      status,
      containerEmpty:
        containerEmpty == null ? null : (containerEmpty as boolean),
    },
  };
}
