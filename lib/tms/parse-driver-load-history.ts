import type { DriverMoveCard } from '@/lib/loads/driver-move-card';
import { parseDriverMoveCard } from '@/lib/tms/parse-driver-loads';

export type ParseDriverLoadHistoryResult =
  | { ok: true; history: DriverMoveCard[] }
  | { ok: false; error: string };

function parseHistoryList(raw: unknown): DriverMoveCard[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => parseDriverMoveCard(item))
    .filter((c): c is DriverMoveCard => c != null);
}

/**
 * Parses `GET /api/mobile/driver/loads/history` → move cards (same shape as Active/Upcoming).
 */
export function parseDriverLoadHistoryResponse(
  body: unknown,
): ParseDriverLoadHistoryResult {
  if (body === null || typeof body !== 'object') {
    return { ok: false, error: 'Load history response was incomplete.' };
  }
  const root = body as Record<string, unknown>;
  if (!('history' in root)) {
    return { ok: false, error: 'Load history response was incomplete.' };
  }
  return { ok: true, history: parseHistoryList(root.history) };
}
