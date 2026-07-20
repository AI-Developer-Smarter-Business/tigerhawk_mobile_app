import {
  CENTRAL_TZ,
  centralDay,
  formatCentralLongDate,
  formatCentralTime,
  formatElapsedClock,
  isCentralToday,
} from '@/lib/time/central';

describe('central time helpers (I.4)', () => {
  it('exports America/Chicago as the product timezone', () => {
    expect(CENTRAL_TZ).toBe('America/Chicago');
  });

  it('formats a known UTC instant in Central', () => {
    // 2026-07-20T18:00:00Z = 1:00 PM CDT
    expect(formatCentralTime('2026-07-20T18:00:00.000Z')).toMatch(/1:00\s*PM/i);
    expect(centralDay('2026-07-20T18:00:00.000Z')).toBe('2026-07-20');
    expect(formatCentralLongDate('2026-07-20T18:00:00.000Z')).toMatch(
      /July 20, 2026/,
    );
  });

  it('formats elapsed duration from a start instant', () => {
    const start = '2026-07-20T12:00:00.000Z';
    const now = Date.parse('2026-07-20T12:01:05.000Z');
    expect(formatElapsedClock(start, now)).toBe('1:05');
    const later = Date.parse('2026-07-20T13:02:03.000Z');
    expect(formatElapsedClock(start, later)).toBe('1:02:03');
  });

  it('detects Central calendar today', () => {
    const todayIso = new Date().toISOString();
    expect(isCentralToday(todayIso)).toBe(true);
    expect(isCentralToday('2020-01-01T12:00:00.000Z')).toBe(false);
  });
});
