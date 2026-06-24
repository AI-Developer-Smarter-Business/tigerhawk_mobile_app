jest.mock('expo-router', () => ({
  useFocusEffect: (callback: () => void | (() => void)) => {
    const React = require('react');
    React.useEffect(() => callback(), [callback]);
  },
}));

jest.mock('@/hooks/useNetwork', () => ({
  useNetwork: jest.fn(() => ({ isOffline: false, isReady: true })),
}));

jest.mock('@/lib/location/get-foreground-position', () => ({
  getForegroundPosition: jest.fn(),
}));

jest.mock('@/lib/location/location-permission', () => ({
  getForegroundPermissionSnapshot: jest.fn(async () => ({
    granted: true,
    canAskAgain: true,
    servicesEnabled: true,
  })),
}));

jest.mock('@/lib/supabase/queries/update-load-live-location', () => ({
  updateLoadLiveLocation: jest.fn(async () => undefined),
}));

import { act, waitFor } from '@testing-library/react-native';

import { useDriverLocationTracking } from '@/hooks/useDriverLocationTracking';
import { createMockLoadDetail } from '@/hooks/testing/fixtures/mock-load-detail';
import { renderDriverHook } from '@/hooks/testing/hooks-test-utils';
import { useNetwork } from '@/hooks/useNetwork';
import { getForegroundPosition } from '@/lib/location/get-foreground-position';
import { updateLoadLiveLocation } from '@/lib/supabase/queries/update-load-live-location';

const mockGetPosition = getForegroundPosition as jest.MockedFunction<typeof getForegroundPosition>;
const mockUpdate = updateLoadLiveLocation as jest.MockedFunction<typeof updateLoadLiveLocation>;
const mockUseNetwork = useNetwork as jest.MockedFunction<typeof useNetwork>;

const samplePosition = {
  latitude: 29.7604,
  longitude: -95.3698,
  accuracyMeters: 12,
  timestamp: 1_718_000_000_000,
};

describe('useDriverLocationTracking', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    mockUseNetwork.mockReturnValue({ isOffline: false, isReady: true });
    mockGetPosition.mockResolvedValue(samplePosition);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('sends an initial ping when load detail is focused on active trip', async () => {
    const load = createMockLoadDetail({ status: 'In Transit' });

    const { result } = renderDriverHook(() => useDriverLocationTracking(load));

    await waitFor(() => {
      expect(mockGetPosition).toHaveBeenCalled();
      expect(mockUpdate).toHaveBeenCalled();
    });

    expect(result.current.isTracking).toBe(true);
    expect(result.current.lastSentAtMs).not.toBeNull();
    expect(result.current.lastPosition).toEqual(samplePosition);
  });

  it('does not track when load status is Assigned', async () => {
    const load = createMockLoadDetail({ status: 'Assigned' });

    renderDriverHook(() => useDriverLocationTracking(load));

    await act(async () => {
      await Promise.resolve();
    });

    expect(mockGetPosition).not.toHaveBeenCalled();
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it('skips ticks while offline', async () => {
    mockUseNetwork.mockReturnValue({ isOffline: true, isReady: true });
    const load = createMockLoadDetail({ status: 'In Transit' });

    renderDriverHook(() => useDriverLocationTracking(load));

    await act(async () => {
      await Promise.resolve();
    });

    expect(mockGetPosition).not.toHaveBeenCalled();
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it('schedules interval ticks after the first ping', async () => {
    const load = createMockLoadDetail({ status: 'Arrived At Delivery' });

    renderDriverHook(() => useDriverLocationTracking(load));

    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalledTimes(1);
    });

    mockGetPosition.mockResolvedValue({
      ...samplePosition,
      latitude: 29.77,
      longitude: -95.37,
    });

    await act(async () => {
      jest.advanceTimersByTime(45_000);
      await Promise.resolve();
    });

    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalledTimes(2);
    });
  });
});
