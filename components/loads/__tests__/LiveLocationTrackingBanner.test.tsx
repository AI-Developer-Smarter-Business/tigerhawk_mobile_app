jest.mock('@/hooks/useNetwork', () => ({
  useNetwork: jest.fn(() => ({ isOffline: false, isReady: true })),
}));

import { render, screen } from '@testing-library/react-native';
import { Platform } from 'react-native';

import { LiveLocationTrackingBanner } from '@/components/loads/LiveLocationTrackingBanner';
import { strings } from '@/constants/strings';
import type { DriverLocationTrackingState } from '@/hooks/useDriverLocationTracking';

const baseTracking: DriverLocationTrackingState = {
  isTracking: false,
  lastSentAtMs: null,
  lastPosition: null,
  error: null,
  needsLocationSettings: false,
};

describe('LiveLocationTrackingBanner', () => {
  const originalOS = Platform.OS;

  beforeEach(() => {
    Platform.OS = 'ios';
  });

  afterEach(() => {
    Platform.OS = originalOS;
  });

  it('renders nothing when load is not on active trip', () => {
    render(
      <LiveLocationTrackingBanner
        tracking={{ ...baseTracking, isTracking: true }}
        loadStatus="Assigned"
      />,
    );
    expect(screen.queryByText(strings.location.liveTrackingBanner)).toBeNull();
  });

  it('shows sharing banner when tracking is active', () => {
    render(
      <LiveLocationTrackingBanner
        tracking={{
          ...baseTracking,
          isTracking: true,
          lastSentAtMs: Date.now() - 30_000,
        }}
        loadStatus="In Transit"
      />,
    );
    expect(screen.getByText(strings.location.liveTrackingBanner)).toBeTruthy();
    expect(screen.getByText(/Last sent:/)).toBeTruthy();
  });

  it('shows settings prompt when location permission is missing', () => {
    render(
      <LiveLocationTrackingBanner
        tracking={{ ...baseTracking, needsLocationSettings: true }}
        loadStatus="In Transit"
      />,
    );
    expect(screen.getByText(strings.location.liveTrackingSettingsTitle)).toBeTruthy();
    expect(screen.getByText(strings.location.openSettings)).toBeTruthy();
  });
});
