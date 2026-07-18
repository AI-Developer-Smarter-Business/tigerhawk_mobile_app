import { QueryClient } from '@tanstack/react-query';

import { resolveLoadDetailForDriver } from '../resolve-load-detail-for-driver';
import { fetchLoadDetailForDriver } from '@/lib/supabase/queries/loads';
import { fetchMobileDriverLoads } from '@/lib/tms/fetch-driver-loads';
import type { DriverMoveCard } from '../driver-move-card';

jest.mock('@/lib/supabase/queries/loads', () => ({
  fetchLoadDetailForDriver: jest.fn(),
}));

jest.mock('@/lib/tms/fetch-driver-loads', () => ({
  fetchMobileDriverLoads: jest.fn(),
}));

const mockFetchLoadDetail = fetchLoadDetailForDriver as jest.MockedFunction<
  typeof fetchLoadDetailForDriver
>;
const mockFetchMobileLoads = fetchMobileDriverLoads as jest.MockedFunction<
  typeof fetchMobileDriverLoads
>;

function card(overrides: Partial<DriverMoveCard> = {}): DriverMoveCard {
  return {
    move_id: 'move-1',
    load_id: 'load-1',
    reference_number: 'THWK_CARD',
    load_type: null,
    status: 'In Transit',
    customer: 'Customer',
    container_number: 'C1',
    seal_number: null,
    container_size: null,
    container_type: null,
    chassis_number: null,
    pickup_location: 'A',
    delivery_location: 'B',
    return_location: null,
    is_hazmat: false,
    is_hot: false,
    last_free_day: null,
    per_diem_free_day: null,
    cut_off_date: null,
    accepted_at: null,
    started_at: '2026-07-17T10:00:00.000Z',
    assigned_date: null,
    stops: [],
    progress: {
      label: 'Arrived At Delivery',
      phase: 'arrived',
      active_move_id: 'move-1',
    },
    ...overrides,
  };
}

describe('resolveLoadDetailForDriver', () => {
  const queryClient = new QueryClient();
  const supabase = {} as never;

  beforeEach(() => {
    jest.clearAllMocks();
    queryClient.clear();
  });

  it('returns Supabase detail when loads.driver_id matches', async () => {
    mockFetchLoadDetail.mockResolvedValue({
      load: {
        id: 'load-1',
        reference_number: 'THWK_SB',
        status: 'Dispatched',
        container_number: null,
        pickup_location: null,
        delivery_location: null,
        delivery_apt_from: null,
        is_hot: false,
        active_holds: [],
        return_location: null,
        pickup_apt_from: null,
        pickup_apt_to: null,
        delivery_apt_to: null,
        notes: null,
        customer_name: null,
        load_type: null,
        route_type: null,
        ssl: null,
        mbol: null,
        house_bol: null,
        seal_number: null,
        chassis_number: null,
        container_size: null,
        container_type: null,
        bol_number: null,
        scheduled_pickup: null,
        actual_pickup: null,
        actual_delivery: null,
        completed_date: null,
        created_at: null,
        customer_phone: null,
        customer_address: null,
        driver_name: null,
        driver_phone: null,
        is_hazmat: false,
        is_overweight: false,
        is_bonded: false,
      },
      errorMessage: null,
      notFound: false,
    });

    const result = await resolveLoadDetailForDriver({
      supabase,
      queryClient,
      loadId: 'load-1',
      driverId: 'driver-1',
    });

    expect(result.fromMoveCard).toBe(false);
    expect(result.load?.reference_number).toBe('THWK_SB');
    expect(mockFetchMobileLoads).not.toHaveBeenCalled();
  });

  it('falls back to the mobile move card when Supabase returns not found', async () => {
    mockFetchLoadDetail.mockResolvedValue({
      load: null,
      errorMessage: null,
      notFound: true,
    });
    mockFetchMobileLoads.mockResolvedValue({
      ok: true,
      buckets: { active: [card()], upcoming: [] },
    });

    const result = await resolveLoadDetailForDriver({
      supabase,
      queryClient,
      loadId: 'load-1',
      driverId: 'driver-1',
      moveId: 'move-1',
    });

    expect(result.notFound).toBe(false);
    expect(result.fromMoveCard).toBe(true);
    expect(result.load?.reference_number).toBe('THWK_CARD');
    expect(result.load?.status).toBe('In Transit');
  });

  it('reports notFound when neither Supabase nor mobile cards have the load', async () => {
    mockFetchLoadDetail.mockResolvedValue({
      load: null,
      errorMessage: null,
      notFound: true,
    });
    mockFetchMobileLoads.mockResolvedValue({
      ok: true,
      buckets: { active: [], upcoming: [] },
    });

    const result = await resolveLoadDetailForDriver({
      supabase,
      queryClient,
      loadId: 'missing',
      driverId: 'driver-1',
    });

    expect(result).toEqual({
      load: null,
      errorMessage: null,
      notFound: true,
      fromMoveCard: false,
    });
  });
});
