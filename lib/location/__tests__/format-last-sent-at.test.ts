import { formatLastSentAt } from '../format-last-sent-at';

describe('formatLastSentAt', () => {
  const now = 1_718_000_000_000;

  it('returns Just now under one minute', () => {
    expect(formatLastSentAt(now - 30_000, now)).toBe('Just now');
  });

  it('returns minutes ago under one hour', () => {
    expect(formatLastSentAt(now - 5 * 60_000, now)).toBe('5 min ago');
  });

  it('returns clock time after one hour', () => {
    const label = formatLastSentAt(now - 2 * 3_600_000, now);
    expect(label).toMatch(/\d/);
    expect(label).not.toBe('Just now');
  });
});
