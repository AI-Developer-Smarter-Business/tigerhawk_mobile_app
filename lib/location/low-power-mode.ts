import * as Battery from 'expo-battery';

/** iOS Low Power Mode / Android battery saver — GPS may be slower or less accurate. */
export async function isLowPowerModeEnabled(): Promise<boolean> {
  try {
    return await Battery.isLowPowerModeEnabledAsync();
  } catch {
    return false;
  }
}
