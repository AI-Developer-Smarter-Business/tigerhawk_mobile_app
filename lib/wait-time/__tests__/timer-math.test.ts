import {
  computeWaitTimerSnapshot,
  formatWaitElapsed,
} from '../timer-math';

describe('computeWaitTimerSnapshot', () => {
  const freeMs = 60 * 60_000;
  const start = '2026-06-10T12:00:00.000Z';

  it('returns idle when no start time', () => {
    const snap = computeWaitTimerSnapshot(null, null);
    expect(snap.phase).toBe('idle');
    expect(snap.elapsedMs).toBe(0);
  });

  it('stays in free phase before 60 minutes', () => {
    const snap = computeWaitTimerSnapshot(
      start,
      null,
      new Date(start).getTime() + 30 * 60_000,
    );
    expect(snap.phase).toBe('free');
    expect(snap.freeMinutesRemaining).toBe(30);
    expect(snap.exceededThreshold).toBe(false);
  });

  it('enters billable phase after 60 minutes', () => {
    const snap = computeWaitTimerSnapshot(
      start,
      null,
      new Date(start).getTime() + freeMs + 5 * 60_000,
    );
    expect(snap.phase).toBe('billable');
    expect(snap.billableMinutes).toBe(5);
    expect(snap.exceededThreshold).toBe(true);
  });

  it('marks stopped when end time is set', () => {
    const end = '2026-06-10T13:30:00.000Z';
    const snap = computeWaitTimerSnapshot(start, end);
    expect(snap.phase).toBe('stopped');
    expect(snap.elapsedMinutes).toBe(90);
  });
});

describe('formatWaitElapsed', () => {
  it('formats sub-hour as mm:ss', () => {
    expect(formatWaitElapsed(5 * 60_000 + 7_000)).toBe('5:07');
  });

  it('formats hour+ as Xh YYm', () => {
    expect(formatWaitElapsed(65 * 60_000)).toBe('1h 05m');
  });
});
