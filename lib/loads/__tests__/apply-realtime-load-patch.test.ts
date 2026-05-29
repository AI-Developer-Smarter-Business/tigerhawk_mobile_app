import {
  patchActiveHoldsFromRealtime,
  patchLoadDetailFromRealtimeRow,
} from '@/lib/loads/apply-realtime-load-patch';
import type { LoadDetail } from '@/types';

const baseLoad: LoadDetail = {
  id: 'load-1',
  reference_number: 'TH-1',
  status: 'Dispatched',
  container_number: null,
  pickup_location: 'A',
  delivery_location: 'B',
  delivery_apt_from: null,
  is_hot: false,
  active_holds: ['freight_hold'],
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
  is_hazmat: false,
  is_overweight: false,
  is_bonded: false,
};

describe('apply-realtime-load-patch', () => {
  it('clears freight hold when TMS sets released', () => {
    const next = patchActiveHoldsFromRealtime(['freight_hold'], {
      freight_hold: 'released',
    });
    expect(next).toEqual([]);
  });

  it('patches load detail active_holds from partial realtime row', () => {
    const next = patchLoadDetailFromRealtimeRow(baseLoad, {
      freight_hold: 'released',
    });
    expect(next?.active_holds).toEqual([]);
  });
});
