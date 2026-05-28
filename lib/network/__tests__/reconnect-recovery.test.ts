import { shouldRunReconnectRecovery } from '../reconnect-recovery';

describe('shouldRunReconnectRecovery', () => {
  it('runs when coming back online after offline', () => {
    expect(shouldRunReconnectRecovery(true, false, false)).toBe(true);
  });

  it('skips when still offline or already recovering', () => {
    expect(shouldRunReconnectRecovery(true, true, false)).toBe(false);
    expect(shouldRunReconnectRecovery(true, false, true)).toBe(false);
    expect(shouldRunReconnectRecovery(false, false, false)).toBe(false);
  });
});
