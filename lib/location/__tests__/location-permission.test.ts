import * as Location from 'expo-location';

import { getForegroundPermissionSnapshot } from '../location-permission';

jest.mock('expo-location', () => ({
  PermissionStatus: { GRANTED: 'granted', DENIED: 'denied' },
  getForegroundPermissionsAsync: jest.fn(),
  hasServicesEnabledAsync: jest.fn(),
}));

const mockLocation = Location as jest.Mocked<typeof Location>;

describe('getForegroundPermissionSnapshot', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocation.hasServicesEnabledAsync.mockResolvedValue(true);
  });

  it('reports granted when permission is granted', async () => {
    mockLocation.getForegroundPermissionsAsync.mockResolvedValue({
      status: Location.PermissionStatus.GRANTED,
      granted: true,
      expires: 'never',
      canAskAgain: true,
    });

    const snap = await getForegroundPermissionSnapshot();
    expect(snap.granted).toBe(true);
    expect(snap.servicesEnabled).toBe(true);
  });

  it('reports denied and canAskAgain false', async () => {
    mockLocation.getForegroundPermissionsAsync.mockResolvedValue({
      status: Location.PermissionStatus.DENIED,
      granted: false,
      expires: 'never',
      canAskAgain: false,
    });
    mockLocation.hasServicesEnabledAsync.mockResolvedValue(false);

    const snap = await getForegroundPermissionSnapshot();
    expect(snap.granted).toBe(false);
    expect(snap.canAskAgain).toBe(false);
    expect(snap.servicesEnabled).toBe(false);
  });
});
