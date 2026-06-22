jest.mock('@/lib/wait-time/config', () => ({
  isWaitTimeMockMode: jest.fn(() => false),
}));
jest.mock('@/lib/tms', () => ({
  resolveSupabaseAccessToken: jest.fn(async () => 'jwt-token'),
}));
jest.mock('@/lib/tms/wait-time', () => ({
  fetchWaitTimeEvents: jest.fn(async () => ({ events: [], summary: {} })),
  startDeliveryWaitEvent: jest.fn(),
  endOpenDeliveryWaitEvent: jest.fn(),
  syncOpenDeliveryWaitDuration: jest.fn(),
}));

import { act, waitFor } from '@testing-library/react-native';

import { useDeliveryWaitTimer } from '@/hooks/useDeliveryWaitTimer';
import { createMockLoadDetail } from '@/hooks/testing/fixtures/mock-load-detail';
import { renderDriverHook } from '@/hooks/testing/hooks-test-utils';
import {
  fetchWaitTimeEvents,
  startDeliveryWaitEvent,
} from '@/lib/tms/wait-time';

const mockFetch = fetchWaitTimeEvents as jest.MockedFunction<typeof fetchWaitTimeEvents>;
const mockStart = startDeliveryWaitEvent as jest.MockedFunction<typeof startDeliveryWaitEvent>;

describe('useDeliveryWaitTimer (WT.27)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockResolvedValue({
      events: [],
      summary: {
        count: 0,
        total_minutes: 0,
        total_hours: 0,
        total_billable: 0,
        total_driver_pay: 0,
      },
    });
  });

  it('does not auto-start when load is Arrived At Delivery', async () => {
    const load = createMockLoadDetail({
      status: 'Arrived At Delivery',
    });

    const { result } = renderDriverHook(() => useDeliveryWaitTimer(load));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled();
    });

    expect(mockStart).not.toHaveBeenCalled();
    expect(result.current.canStart).toBe(true);
    expect(result.current.startTimeIso).toBeNull();
    expect(result.current.visible).toBe(true);
  });

  it('starts only when startTimer is invoked', async () => {
    const load = createMockLoadDetail({ status: 'Arrived At Delivery' });
    const startedEvent = {
      id: 'evt-new',
      load_id: load.id,
      event_name: 'delivery_wait',
      start_time: '2026-06-18T10:05:00.000Z',
      end_time: null,
      duration_minutes: null,
      free_time_minutes: 60,
      billable: false,
      charge_amount: null,
      driver_pay_amount: null,
      location: null,
    };
    mockStart.mockResolvedValue(startedEvent);
    mockFetch
      .mockResolvedValueOnce({
        events: [],
        summary: {
          count: 0,
          total_minutes: 0,
          total_hours: 0,
          total_billable: 0,
          total_driver_pay: 0,
        },
      })
      .mockResolvedValue({
        events: [startedEvent],
        summary: {
          count: 1,
          total_minutes: 0,
          total_hours: 0,
          total_billable: 0,
          total_driver_pay: 0,
        },
      });

    const { result } = renderDriverHook(() => useDeliveryWaitTimer(load));

    await waitFor(() => {
      expect(result.current.canStart).toBe(true);
    });

    await act(async () => {
      await result.current.startTimer();
    });

    expect(mockStart).toHaveBeenCalledTimes(1);
    expect(result.current.startTimeIso).toBe('2026-06-18T10:05:00.000Z');
    expect(result.current.canStart).toBe(false);
    expect(result.current.canStop).toBe(true);
  });
});
