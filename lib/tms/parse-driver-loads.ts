import type {
  DriverLoadsBuckets,
  DriverMoveCard,
  DriverMoveProgress,
  DriverMoveStop,
} from '@/lib/loads/driver-move-card';
import { partitionDriverMoveCards } from '@/lib/loads/partition-driver-move-cards';

function asObject(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === 'object'
    ? (value as Record<string, unknown>)
    : null;
}

function asString(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function asNullableString(value: unknown): string | null {
  if (value == null) return null;
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function asBoolean(value: unknown): boolean {
  return value === true;
}

function parseProgress(raw: unknown): DriverMoveProgress {
  const obj = asObject(raw);
  return {
    label: asString(obj?.label) ?? '',
    phase: asString(obj?.phase) ?? '',
    active_move_id: asNullableString(obj?.active_move_id),
  };
}

function parseStop(raw: unknown): DriverMoveStop | null {
  const obj = asObject(raw);
  if (!obj) return null;
  const id = asString(obj.id);
  const event_type = asString(obj.event_type);
  if (!id || !event_type) return null;
  return {
    id,
    event_type,
    location: obj.location ?? null,
    arrived_at: asNullableString(obj.arrived_at),
    departed_at: asNullableString(obj.departed_at),
  };
}

function parseStops(raw: unknown): DriverMoveStop[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => parseStop(item))
    .filter((s): s is DriverMoveStop => s != null);
}

/**
 * Parses one move card from `GET /api/mobile/driver/loads`.
 * Requires `move_id` + `load_id` — cards are moves, not loads.
 */
export function parseDriverMoveCard(raw: unknown): DriverMoveCard | null {
  const obj = asObject(raw);
  if (!obj) return null;

  const move_id = asString(obj.move_id);
  const load_id = asString(obj.load_id);
  if (!move_id || !load_id) return null;

  return {
    move_id,
    load_id,
    reference_number: asNullableString(obj.reference_number),
    load_type: asNullableString(obj.load_type),
    status: asString(obj.status) ?? '',
    customer: asNullableString(obj.customer),
    container_number: asNullableString(obj.container_number),
    seal_number: asNullableString(obj.seal_number),
    container_size: asNullableString(obj.container_size),
    container_type: asNullableString(obj.container_type),
    chassis_number: asNullableString(obj.chassis_number),
    pickup_location: asNullableString(obj.pickup_location),
    delivery_location: asNullableString(obj.delivery_location),
    return_location: asNullableString(obj.return_location),
    is_hazmat: asBoolean(obj.is_hazmat),
    is_hot: asBoolean(obj.is_hot),
    last_free_day: asNullableString(obj.last_free_day),
    per_diem_free_day: asNullableString(obj.per_diem_free_day),
    cut_off_date: asNullableString(obj.cut_off_date),
    accepted_at: asNullableString(obj.accepted_at),
    started_at: asNullableString(obj.started_at),
    assigned_date: asNullableString(obj.assigned_date),
    stops: parseStops(obj.stops),
    progress: parseProgress(obj.progress),
  };
}

function parseCardList(raw: unknown): DriverMoveCard[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => parseDriverMoveCard(item))
    .filter((c): c is DriverMoveCard => c != null);
}

export type ParseDriverLoadsResult =
  | { ok: true; buckets: DriverLoadsBuckets }
  | { ok: false; error: string };

/**
 * Accepts either server `{ active, upcoming }` or a flat card list (re-partition Q14).
 */
export function parseDriverLoadsResponse(body: unknown): ParseDriverLoadsResult {
  const root = asObject(body);
  if (!root) {
    return { ok: false, error: 'Driver loads response was incomplete.' };
  }

  if ('active' in root || 'upcoming' in root) {
    const active = parseCardList(root.active);
    const upcoming = parseCardList(root.upcoming);
    // Trust server buckets, but drop malformed cards already filtered in parse.
    // Re-partition to keep client Q14 rule identical if a card is mis-bucketed.
    return {
      ok: true,
      buckets: partitionDriverMoveCards([...active, ...upcoming]),
    };
  }

  if (Array.isArray(root.cards)) {
    return { ok: true, buckets: partitionDriverMoveCards(parseCardList(root.cards)) };
  }

  return { ok: false, error: 'Driver loads response was incomplete.' };
}
