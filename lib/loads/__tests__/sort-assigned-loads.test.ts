import { sortAssignedLoadsByPriority } from '../sort-assigned-loads';
import type { LoadDetail } from '@/types';

function load(partial: Partial<LoadDetail> & Pick<LoadDetail, 'id' | 'reference_number'>): LoadDetail {
  return {
    status: 'Assigned',
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
    ...partial,
  };
}

describe('sortAssignedLoadsByPriority', () => {
  it('places HOT loads before non-HOT', () => {
    const sorted = sortAssignedLoadsByPriority([
      load({ id: '1', reference_number: 'A', is_hot: false }),
      load({ id: '2', reference_number: 'B', is_hot: true }),
    ]);
    expect(sorted.map((l) => l.id)).toEqual(['2', '1']);
  });

  it('sorts by created_at desc within same HOT tier', () => {
    const sorted = sortAssignedLoadsByPriority([
      load({ id: '1', reference_number: 'OLD', created_at: '2026-06-01T10:00:00Z' }),
      load({ id: '2', reference_number: 'NEW', created_at: '2026-06-02T10:00:00Z' }),
    ]);
    expect(sorted.map((l) => l.id)).toEqual(['2', '1']);
  });
});
