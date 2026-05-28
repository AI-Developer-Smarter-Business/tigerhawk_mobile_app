import {
  FOCUS_DOCUMENTS_REFETCH_MIN_MS,
  FOREGROUND_LOADS_REFETCH_MIN_MS,
  resetThrottledRefetchKeys,
  shouldRunThrottledRefetch,
} from '../foreground-refetch-throttle';

describe('shouldRunThrottledRefetch', () => {
  beforeEach(() => {
    resetThrottledRefetchKeys();
  });

  it('allows first run and blocks until interval elapses', () => {
    const key = 'loads:user-1';
    expect(shouldRunThrottledRefetch(key, FOREGROUND_LOADS_REFETCH_MIN_MS, 0)).toBe(true);
    expect(shouldRunThrottledRefetch(key, FOREGROUND_LOADS_REFETCH_MIN_MS, 1000)).toBe(false);
    expect(
      shouldRunThrottledRefetch(
        key,
        FOREGROUND_LOADS_REFETCH_MIN_MS,
        FOREGROUND_LOADS_REFETCH_MIN_MS,
      ),
    ).toBe(true);
  });

  it('tracks keys independently', () => {
    expect(shouldRunThrottledRefetch('a', 1000, 0)).toBe(true);
    expect(shouldRunThrottledRefetch('b', 1000, 500)).toBe(true);
    expect(shouldRunThrottledRefetch('a', 1000, 500)).toBe(false);
  });

  it('exports document focus interval constant', () => {
    expect(FOCUS_DOCUMENTS_REFETCH_MIN_MS).toBeGreaterThan(0);
  });
});
