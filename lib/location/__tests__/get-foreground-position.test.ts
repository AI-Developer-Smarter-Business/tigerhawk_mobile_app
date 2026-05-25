import * as Location from 'expo-location';

import { getForegroundPosition } from '../get-foreground-position';
import { LocationError } from '../location-errors';

jest.mock('expo-location', () => ({
  PermissionStatus: { GRANTED: 'granted', DENIED: 'denied' },
  Accuracy: { Balanced: 3 },
  hasServicesEnabledAsync: jest.fn(),
  getForegroundPermissionsAsync: jest.fn(),
  requestForegroundPermissionsAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
}));

const mockLocation = Location as jest.Mocked<typeof Location>;

describe('getForegroundPosition', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocation.hasServicesEnabledAsync.mockResolvedValue(true);
    mockLocation.getForegroundPermissionsAsync.mockResolvedValue({
      status: Location.PermissionStatus.GRANTED,
      granted: true,
      expires: 'never',
      canAskAgain: true,
    });
  });

  it('returns coordinates when permission is granted', async () => {
    mockLocation.getCurrentPositionAsync.mockResolvedValue({
      coords: {
        latitude: 29.76,
        longitude: -95.37,
        accuracy: 8,
        altitude: null,
        altitudeAccuracy: null,
        heading: null,
        speed: null,
      },
      timestamp: 1_700_000_000_000,
    });

    const result = await getForegroundPosition();

    expect(result).toEqual({
      latitude: 29.76,
      longitude: -95.37,
      accuracyMeters: 8,
      timestamp: 1_700_000_000_000,
    });
    expect(mockLocation.getCurrentPositionAsync).toHaveBeenCalledWith({
      accuracy: Location.Accuracy.Balanced,
    });
  });

  it('requests permission when not yet granted', async () => {
    mockLocation.getForegroundPermissionsAsync.mockResolvedValue({
      status: Location.PermissionStatus.DENIED,
      granted: false,
      expires: 'never',
      canAskAgain: true,
    });
    mockLocation.requestForegroundPermissionsAsync.mockResolvedValue({
      status: Location.PermissionStatus.GRANTED,
      granted: true,
      expires: 'never',
      canAskAgain: true,
    });
    mockLocation.getCurrentPositionAsync.mockResolvedValue({
      coords: {
        latitude: 1,
        longitude: 2,
        accuracy: null,
        altitude: null,
        altitudeAccuracy: null,
        heading: null,
        speed: null,
      },
      timestamp: 1,
    });

    await getForegroundPosition();

    expect(mockLocation.requestForegroundPermissionsAsync).toHaveBeenCalled();
  });

  it('throws PERMISSION_DENIED when user declines', async () => {
    mockLocation.getForegroundPermissionsAsync.mockResolvedValue({
      status: Location.PermissionStatus.DENIED,
      granted: false,
      expires: 'never',
      canAskAgain: false,
    });
    mockLocation.requestForegroundPermissionsAsync.mockResolvedValue({
      status: Location.PermissionStatus.DENIED,
      granted: false,
      expires: 'never',
      canAskAgain: false,
    });

    await expect(getForegroundPosition()).rejects.toMatchObject({
      code: 'PERMISSION_DENIED',
    });
  });

  it('throws SERVICES_DISABLED when location is off', async () => {
    mockLocation.hasServicesEnabledAsync.mockResolvedValue(false);

    await expect(getForegroundPosition()).rejects.toBeInstanceOf(LocationError);
    await expect(getForegroundPosition()).rejects.toMatchObject({
      code: 'SERVICES_DISABLED',
    });
  });
});
