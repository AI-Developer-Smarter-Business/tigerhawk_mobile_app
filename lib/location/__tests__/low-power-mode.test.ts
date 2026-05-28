import * as Battery from 'expo-battery';

import { isLowPowerModeEnabled } from '../low-power-mode';

jest.mock('expo-battery', () => ({
  isLowPowerModeEnabledAsync: jest.fn(),
}));

const mockBattery = Battery as jest.Mocked<typeof Battery>;

describe('isLowPowerModeEnabled', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns true when OS reports low power mode', async () => {
    mockBattery.isLowPowerModeEnabledAsync.mockResolvedValue(true);
    await expect(isLowPowerModeEnabled()).resolves.toBe(true);
  });

  it('returns false when API fails', async () => {
    mockBattery.isLowPowerModeEnabledAsync.mockRejectedValue(new Error('unavailable'));
    await expect(isLowPowerModeEnabled()).resolves.toBe(false);
  });
});
