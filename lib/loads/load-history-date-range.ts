/**
 * Date range helpers for Load History (TASKS B.4 · PortPro MM/DD/YY label).
 */

export type LoadHistoryDateRange = {
  from: Date;
  to: Date;
};

function startOfLocalDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Default: yesterday through today (PortPro empty-state screenshot). */
export function defaultLoadHistoryDateRange(now = new Date()): LoadHistoryDateRange {
  const to = startOfLocalDay(now);
  const from = new Date(to);
  from.setDate(from.getDate() - 1);
  return { from, to };
}

export function loadHistoryPresetRange(
  preset: 'yesterdayToday' | 'last7Days' | 'last30Days',
  now = new Date(),
): LoadHistoryDateRange {
  const to = startOfLocalDay(now);
  const from = new Date(to);
  if (preset === 'yesterdayToday') {
    from.setDate(from.getDate() - 1);
  } else if (preset === 'last7Days') {
    from.setDate(from.getDate() - 6);
  } else {
    from.setDate(from.getDate() - 29);
  }
  return { from, to };
}

function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

/** PortPro-style label: `07/11/26 - 07/12/26`. */
export function formatLoadHistoryDateRangeLabel(range: LoadHistoryDateRange): string {
  const fmt = (d: Date) => {
    const mm = pad2(d.getMonth() + 1);
    const dd = pad2(d.getDate());
    const yy = String(d.getFullYear()).slice(-2);
    return `${mm}/${dd}/${yy}`;
  };
  return `${fmt(range.from)} - ${fmt(range.to)}`;
}

/** Query params for `GET /api/mobile/driver/loads/history`. */
export function toLoadHistoryQueryDates(range: LoadHistoryDateRange): {
  from: string;
  to: string;
} {
  const iso = (d: Date) => {
    const y = d.getFullYear();
    const m = pad2(d.getMonth() + 1);
    const day = pad2(d.getDate());
    return `${y}-${m}-${day}`;
  };
  return { from: iso(range.from), to: iso(range.to) };
}

export function loadHistoryRangesEqual(
  a: LoadHistoryDateRange,
  b: LoadHistoryDateRange,
): boolean {
  return (
    a.from.getTime() === b.from.getTime() && a.to.getTime() === b.to.getTime()
  );
}
