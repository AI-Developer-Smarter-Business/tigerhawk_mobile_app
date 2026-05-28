/** Minimum interval between foreground-driven invalidations (per key). */
export const FOREGROUND_LOADS_REFETCH_MIN_MS = 30_000;

/** Load detail: refresh documents for fresh signed URLs without hammering TMS. */
export const FOCUS_DOCUMENTS_REFETCH_MIN_MS = 15_000;

const lastRunAt = new Map<string, number>();

/**
 * Returns true when enough time passed since the last run for this key.
 * Use for AppState resume and screen focus refetches.
 */
export function shouldRunThrottledRefetch(
  key: string,
  minIntervalMs: number,
  nowMs = Date.now(),
): boolean {
  const last = lastRunAt.get(key);
  if (last === undefined) {
    lastRunAt.set(key, nowMs);
    return true;
  }
  if (nowMs - last < minIntervalMs) {
    return false;
  }
  lastRunAt.set(key, nowMs);
  return true;
}

/** Test helper */
export function resetThrottledRefetchKeys(): void {
  lastRunAt.clear();
}
