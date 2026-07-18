import {
  defaultLoadHistoryDateRange,
  formatLoadHistoryDateRangeLabel,
  loadHistoryPresetRange,
  toLoadHistoryQueryDates,
} from '@/lib/loads/load-history-date-range';

describe('load-history-date-range (B.4)', () => {
  const now = new Date('2026-07-12T15:00:00');

  it('defaults to yesterday through today', () => {
    const range = defaultLoadHistoryDateRange(now);
    expect(range.from.getFullYear()).toBe(2026);
    expect(range.from.getMonth()).toBe(6);
    expect(range.from.getDate()).toBe(11);
    expect(range.to.getDate()).toBe(12);
  });

  it('formats PortPro-style label', () => {
    const range = loadHistoryPresetRange('yesterdayToday', now);
    expect(formatLoadHistoryDateRangeLabel(range)).toBe('07/11/26 - 07/12/26');
  });

  it('builds ISO query dates', () => {
    const range = defaultLoadHistoryDateRange(now);
    expect(toLoadHistoryQueryDates(range)).toEqual({
      from: '2026-07-11',
      to: '2026-07-12',
    });
  });

  it('last 7 days spans 7 calendar days inclusive', () => {
    const range = loadHistoryPresetRange('last7Days', now);
    expect(toLoadHistoryQueryDates(range)).toEqual({
      from: '2026-07-06',
      to: '2026-07-12',
    });
  });
});
