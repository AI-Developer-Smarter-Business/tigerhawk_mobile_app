import { render, screen } from '@testing-library/react-native';

import { DeliveryWaitSection } from '@/components/loads/DeliveryWaitSection';
import { strings } from '@/constants/strings';
import type { DeliveryWaitTimerState } from '@/hooks/useDeliveryWaitTimer';
import { computeWaitTimerSnapshot } from '@/lib/wait-time/timer-math';
import type { WaitPaySummary } from '@/lib/wait-time/wait-pay-summary';

const EMPTY_PAY_SUMMARY: WaitPaySummary = {
  visible: false,
  closedEventCount: 0,
  closedMinutes: 0,
  closedDriverPay: 0,
  activeMinutes: 0,
  activeDriverPayEstimate: 0,
  totalMinutes: 0,
  totalDriverPay: 0,
  isActiveEstimate: false,
};

function buildTimer(
  overrides: Partial<DeliveryWaitTimerState> = {},
): DeliveryWaitTimerState {
  const { snapshot: snapshotOverride, ...rest } = overrides;
  const snapshot =
    snapshotOverride ??
    computeWaitTimerSnapshot(
      overrides.startTimeIso ?? null,
      overrides.stoppedAtIso ?? null,
    );
  return {
    visible: false,
    active: false,
    canStart: false,
    mockMode: false,
    startTimeIso: null,
    stoppedAtIso: null,
    snapshot,
    formattedElapsed: '0:00',
    paySummary: EMPTY_PAY_SUMMARY,
    eventId: null,
    usingFallbackStart: false,
    exceededNotified: false,
    loading: false,
    stopping: false,
    canStop: false,
    startTimer: jest.fn(async () => undefined),
    stopTimer: jest.fn(async () => undefined),
    refresh: jest.fn(async () => undefined),
    error: null,
    ...rest,
  };
}

describe('DeliveryWaitSection', () => {
  it('renders nothing when not visible', () => {
    render(<DeliveryWaitSection timer={buildTimer({ visible: false })} />);
    expect(screen.queryByText(strings.waitTime.sectionTitle)).toBeNull();
  });

  it('shows Check In when eligible and not running (WT.27)', () => {
    render(
      <DeliveryWaitSection
        timer={buildTimer({
          visible: true,
          canStart: true,
        })}
      />,
    );
    expect(screen.getByText(strings.waitTime.checkIn)).toBeTruthy();
    expect(screen.getByText(strings.waitTime.checkInHint)).toBeTruthy();
    expect(screen.queryByText('0:00')).toBeNull();
  });

  it('shows elapsed time and Check Out when running', () => {
    render(
      <DeliveryWaitSection
        timer={buildTimer({
          visible: true,
          active: true,
          canStop: true,
          startTimeIso: '2026-06-11T14:00:00.000Z',
          formattedElapsed: '5:00',
          snapshot: computeWaitTimerSnapshot(
            '2026-06-11T14:00:00.000Z',
            null,
            new Date('2026-06-11T14:05:00.000Z').getTime(),
          ),
        })}
      />,
    );
    expect(screen.getByText('5:00')).toBeTruthy();
    expect(screen.getByText(strings.waitTime.checkOut)).toBeTruthy();
    expect(screen.queryByText(strings.waitTime.checkIn)).toBeNull();
  });

  it('shows wait pay summary when accrued (WT.22)', () => {
    render(
      <DeliveryWaitSection
        timer={buildTimer({
          visible: true,
          active: true,
          canStop: true,
          startTimeIso: '2026-06-11T14:00:00.000Z',
          formattedElapsed: '1h 05m',
          paySummary: {
            visible: true,
            closedEventCount: 0,
            closedMinutes: 0,
            closedDriverPay: 0,
            activeMinutes: 65,
            activeDriverPayEstimate: 81.25,
            totalMinutes: 65,
            totalDriverPay: 81.25,
            isActiveEstimate: true,
          },
        })}
      />,
    );
    expect(screen.getByText(strings.waitTime.paySummaryTitle)).toBeTruthy();
    expect(screen.getByText('1h 5 min')).toBeTruthy();
    expect(screen.getByText('$81.25')).toBeTruthy();
    expect(screen.getByText(strings.waitTime.payEstimateHint)).toBeTruthy();
  });
});
