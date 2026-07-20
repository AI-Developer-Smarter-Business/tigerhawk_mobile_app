/**
 * Tigerhawk operates in US Central time (I.4).
 * Wire formats stay UTC ISO; display uses America/Chicago (DST-aware).
 */

export const CENTRAL_TZ = 'America/Chicago';

function asDate(value: string | number | Date | null | undefined): Date | null {
  if (value == null || value === '') return null;
  const d = value instanceof Date ? value : new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** Central calendar date YYYY-MM-DD for an instant. */
export function centralDay(
  value: string | number | Date | null | undefined,
): string | null {
  const d = asDate(value);
  if (!d) return null;
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: CENTRAL_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d);
}

/** Today's Central calendar date (YYYY-MM-DD). */
export function centralToday(): string {
  return centralDay(new Date()) as string;
}

/** Long Central date for screen headers — e.g. `July 20, 2026`. */
export function formatCentralLongDate(
  value: string | number | Date | null | undefined = new Date(),
): string {
  const d = asDate(value) ?? new Date();
  return new Intl.DateTimeFormat('en-US', {
    timeZone: CENTRAL_TZ,
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(d);
}

/** Central wall-clock time — e.g. `1:05 PM`. */
export function formatCentralTime(
  value: string | number | Date | null | undefined,
): string {
  const d = asDate(value);
  if (!d) return '—';
  return new Intl.DateTimeFormat('en-US', {
    timeZone: CENTRAL_TZ,
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(d);
}

/**
 * Elapsed wall time from `fromIso` to `now` as `H:MM:SS` or `M:SS`.
 * Digits only — not timezone-converted (duration is absolute).
 */
export function formatElapsedClock(
  fromIso: string | null | undefined,
  nowMs: number = Date.now(),
): string {
  const start = asDate(fromIso);
  if (!start) return '0:00';
  const totalSec = Math.max(0, Math.floor((nowMs - start.getTime()) / 1000));
  const hours = Math.floor(totalSec / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;
  const mm = String(minutes).padStart(2, '0');
  const ss = String(seconds).padStart(2, '0');
  if (hours > 0) return `${hours}:${mm}:${ss}`;
  return `${minutes}:${ss}`;
}

/** True when `iso` falls on today's Central calendar date. */
export function isCentralToday(
  iso: string | number | Date | null | undefined,
): boolean {
  const day = centralDay(iso);
  return day != null && day === centralToday();
}
