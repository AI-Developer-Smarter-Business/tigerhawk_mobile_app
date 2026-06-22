import type { WaitTimeEvent } from '@/lib/tms/wait-time';

import {
  DEFAULT_DRIVER_WAIT_RATE_PER_HOUR,
  DELIVERY_WAIT_EVENT,
} from './constants';

export type WaitPaySummary = {
  /** Show read-only pay panel when there is accrued wait time or pay. */
  visible: boolean;
  closedEventCount: number;
  closedMinutes: number;
  closedDriverPay: number;
  activeMinutes: number;
  activeDriverPayEstimate: number;
  totalMinutes: number;
  totalDriverPay: number;
  /** True when an open event contributes a live estimate. */
  isActiveEstimate: boolean;
};

export function formatUsdAmount(amount: number): string {
  return `$${amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatAccruedWaitMinutes(totalMinutes: number): string {
  if (totalMinutes <= 0) return '0 min';
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours > 0 && minutes > 0) return `${hours}h ${minutes} min`;
  if (hours > 0) return `${hours}h`;
  return `${minutes} min`;
}

export function computeDriverPayFromMinutes(
  durationMinutes: number,
  ratePerHour: number = DEFAULT_DRIVER_WAIT_RATE_PER_HOUR,
  driverPayable: boolean = true,
): number {
  if (!driverPayable || durationMinutes <= 0) return 0;
  return Math.round((durationMinutes / 60) * ratePerHour * 100) / 100;
}

function isDeliveryWaitEvent(event: WaitTimeEvent): boolean {
  return event.event_name === DELIVERY_WAIT_EVENT;
}

function resolveClosedDurationMinutes(event: WaitTimeEvent): number {
  if (event.duration_minutes != null && event.duration_minutes >= 0) {
    return event.duration_minutes;
  }
  if (event.start_time && event.end_time) {
    const ms =
      new Date(event.end_time).getTime() - new Date(event.start_time).getTime();
    return Math.max(0, Math.round(ms / 60_000));
  }
  return 0;
}

function resolveClosedDriverPay(event: WaitTimeEvent, durationMinutes: number): number {
  if (event.driver_pay_amount != null && event.driver_pay_amount > 0) {
    return event.driver_pay_amount;
  }
  const rate =
    event.driver_rate_per_hour ?? DEFAULT_DRIVER_WAIT_RATE_PER_HOUR;
  const payable = event.driver_payable !== false;
  return computeDriverPayFromMinutes(durationMinutes, rate, payable);
}

const EMPTY_SUMMARY: WaitPaySummary = {
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

/** Sum closed `delivery_wait` events plus live estimate for the open timer (WT.22). */
export function computeWaitPaySummary(
  events: WaitTimeEvent[],
  options: {
    activeElapsedMinutes?: number;
  } = {},
): WaitPaySummary {
  const deliveryEvents = events.filter(isDeliveryWaitEvent);
  const openEvent =
    deliveryEvents.find((event) => event.start_time && !event.end_time) ?? null;

  let closedDriverPay = 0;
  let closedMinutes = 0;
  let closedEventCount = 0;

  for (const event of deliveryEvents) {
    if (!event.end_time) continue;
    closedEventCount += 1;
    const minutes = resolveClosedDurationMinutes(event);
    closedMinutes += minutes;
    closedDriverPay += resolveClosedDriverPay(event, minutes);
  }

  let activeMinutes = 0;
  let activeDriverPayEstimate = 0;
  const isActiveEstimate = Boolean(
    openEvent && options.activeElapsedMinutes != null,
  );

  if (openEvent && options.activeElapsedMinutes != null) {
    activeMinutes = Math.max(0, options.activeElapsedMinutes);
    const rate =
      openEvent.driver_rate_per_hour ?? DEFAULT_DRIVER_WAIT_RATE_PER_HOUR;
    const payable = openEvent.driver_payable !== false;
    activeDriverPayEstimate = computeDriverPayFromMinutes(
      activeMinutes,
      rate,
      payable,
    );
  }

  const totalMinutes = closedMinutes + activeMinutes;
  const totalDriverPay =
    Math.round((closedDriverPay + activeDriverPayEstimate) * 100) / 100;

  if (deliveryEvents.length === 0 && totalMinutes <= 0 && totalDriverPay <= 0) {
    return EMPTY_SUMMARY;
  }

  return {
    visible: totalMinutes > 0 || totalDriverPay > 0 || closedEventCount > 0,
    closedEventCount,
    closedMinutes,
    closedDriverPay: Math.round(closedDriverPay * 100) / 100,
    activeMinutes,
    activeDriverPayEstimate,
    totalMinutes,
    totalDriverPay,
    isActiveEstimate,
  };
}

/** Demo mode — single local timer, default driver rate. */
export function computeMockWaitPaySummary(
  startTimeIso: string | null,
  stoppedAtIso: string | null,
  elapsedMinutes: number,
): WaitPaySummary {
  if (!startTimeIso || elapsedMinutes <= 0) {
    return EMPTY_SUMMARY;
  }

  const totalDriverPay = computeDriverPayFromMinutes(elapsedMinutes);
  return {
    visible: true,
    closedEventCount: stoppedAtIso ? 1 : 0,
    closedMinutes: stoppedAtIso ? elapsedMinutes : 0,
    closedDriverPay: stoppedAtIso ? totalDriverPay : 0,
    activeMinutes: stoppedAtIso ? 0 : elapsedMinutes,
    activeDriverPayEstimate: stoppedAtIso ? 0 : totalDriverPay,
    totalMinutes: elapsedMinutes,
    totalDriverPay,
    isActiveEstimate: !stoppedAtIso,
  };
}
