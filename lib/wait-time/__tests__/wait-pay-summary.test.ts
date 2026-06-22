import type { WaitTimeEvent } from '@/lib/tms/wait-time';

import {
  computeDriverPayFromMinutes,
  computeMockWaitPaySummary,
  computeWaitPaySummary,
  formatAccruedWaitMinutes,
  formatUsdAmount,
} from '../wait-pay-summary';

function closedEvent(
  overrides: Partial<WaitTimeEvent> = {},
): WaitTimeEvent {
  return {
    id: 'evt-closed',
    load_id: 'load-1',
    event_name: 'delivery_wait',
    start_time: '2026-06-10T12:00:00.000Z',
    end_time: '2026-06-10T13:30:00.000Z',
    duration_minutes: 90,
    free_time_minutes: 60,
    billable: true,
    charge_amount: 50,
    driver_pay_amount: 112.5,
    location: null,
    ...overrides,
  };
}

describe('formatUsdAmount', () => {
  it('formats USD with two decimals', () => {
    expect(formatUsdAmount(112.5)).toBe('$112.50');
    expect(formatUsdAmount(1200)).toBe('$1,200.00');
  });
});

describe('formatAccruedWaitMinutes', () => {
  it('formats minutes and hours', () => {
    expect(formatAccruedWaitMinutes(45)).toBe('45 min');
    expect(formatAccruedWaitMinutes(60)).toBe('1h');
    expect(formatAccruedWaitMinutes(75)).toBe('1h 15 min');
  });
});

describe('computeDriverPayFromMinutes', () => {
  it('uses hourly rate aligned to DB trigger default', () => {
    expect(computeDriverPayFromMinutes(60, 75)).toBe(75);
    expect(computeDriverPayFromMinutes(90, 75)).toBe(112.5);
  });

  it('returns zero when not payable', () => {
    expect(computeDriverPayFromMinutes(90, 75, false)).toBe(0);
  });
});

describe('computeWaitPaySummary', () => {
  it('sums closed events driver_pay_amount', () => {
    const summary = computeWaitPaySummary([
      closedEvent({ id: 'a', driver_pay_amount: 50 }),
      closedEvent({ id: 'b', driver_pay_amount: 62.5 }),
    ]);
    expect(summary.visible).toBe(true);
    expect(summary.closedEventCount).toBe(2);
    expect(summary.closedDriverPay).toBe(112.5);
    expect(summary.totalDriverPay).toBe(112.5);
    expect(summary.totalMinutes).toBe(180);
  });

  it('adds live estimate for open event', () => {
    const summary = computeWaitPaySummary(
      [
        closedEvent({ driver_pay_amount: 50 }),
        {
          id: 'open',
          load_id: 'load-1',
          event_name: 'delivery_wait',
          start_time: '2026-06-10T14:00:00.000Z',
          end_time: null,
          duration_minutes: null,
          free_time_minutes: 60,
          billable: false,
          charge_amount: null,
          driver_pay_amount: null,
          driver_rate_per_hour: 75,
          location: null,
        },
      ],
      { activeElapsedMinutes: 30 },
    );

    expect(summary.closedDriverPay).toBe(50);
    expect(summary.activeMinutes).toBe(30);
    expect(summary.activeDriverPayEstimate).toBe(37.5);
    expect(summary.totalDriverPay).toBe(87.5);
    expect(summary.isActiveEstimate).toBe(true);
  });

  it('derives closed pay from duration when amount is missing', () => {
    const summary = computeWaitPaySummary([
      closedEvent({
        driver_pay_amount: null,
        duration_minutes: 120,
        driver_rate_per_hour: 75,
      }),
    ]);
    expect(summary.totalDriverPay).toBe(150);
  });

  it('returns hidden summary when no delivery wait history', () => {
    const summary = computeWaitPaySummary([
      {
        id: 'pickup',
        load_id: 'load-1',
        event_name: 'pickup_wait',
        start_time: '2026-06-10T12:00:00.000Z',
        end_time: '2026-06-10T13:00:00.000Z',
        duration_minutes: 60,
        free_time_minutes: 60,
        billable: false,
        charge_amount: null,
        driver_pay_amount: null,
        location: null,
      },
    ]);
    expect(summary.visible).toBe(false);
  });
});

describe('computeMockWaitPaySummary', () => {
  it('estimates pay while timer runs', () => {
    const summary = computeMockWaitPaySummary(
      '2026-06-10T12:00:00.000Z',
      null,
      45,
    );
    expect(summary.visible).toBe(true);
    expect(summary.totalMinutes).toBe(45);
    expect(summary.totalDriverPay).toBe(56.25);
    expect(summary.isActiveEstimate).toBe(true);
  });

  it('treats stopped mock timer as closed', () => {
    const summary = computeMockWaitPaySummary(
      '2026-06-10T12:00:00.000Z',
      '2026-06-10T13:00:00.000Z',
      60,
    );
    expect(summary.closedEventCount).toBe(1);
    expect(summary.isActiveEstimate).toBe(false);
    expect(summary.totalDriverPay).toBe(75);
  });
});
