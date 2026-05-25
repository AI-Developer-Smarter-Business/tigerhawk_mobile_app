import {
  GPS_V1_EXPO_PERMISSION,
  GPS_V1_POLICY,
  isForegroundGpsV1,
} from '../gps-v1-policy';

describe('gps-v1-policy', () => {
  it('locks v1 to foreground-only GPS', () => {
    expect(GPS_V1_POLICY.mode).toBe('foreground');
    expect(GPS_V1_POLICY.backgroundTrackingEnabled).toBe(false);
    expect(GPS_V1_EXPO_PERMISSION).toBe('whenInUse');
  });

  it('isForegroundGpsV1 reflects policy', () => {
    expect(isForegroundGpsV1()).toBe(true);
  });
});
