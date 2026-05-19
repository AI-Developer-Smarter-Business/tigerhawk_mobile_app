import type { LoadDetailRow, LoadListRow } from '../../map-load-row';

const BASE_LIST_ROW: LoadListRow = {
  id: 'load-fixture',
  reference_number: 'THWK_FIXTURE',
  status: 'Dispatched',
  pickup_location: 'Terminal A',
  delivery_location: 'Warehouse B',
  return_location: null,
  pickup_apt_from: null,
  pickup_apt_to: null,
  delivery_apt_from: null,
  delivery_apt_to: null,
  is_hot: false,
  notes: null,
  freight_hold: null,
  customs_hold: null,
  terminal_hold: null,
  fees_hold: null,
  other_hold: null,
  carrier_hold: null,
  containers: null,
  customers: null,
};

export function createLoadListRow(overrides: Partial<LoadListRow> = {}): LoadListRow {
  return { ...BASE_LIST_ROW, ...overrides };
}

export function createLoadDetailRow(overrides: Partial<LoadDetailRow> = {}): LoadDetailRow {
  return {
    ...createLoadListRow(),
    load_type: null,
    route_type: null,
    ssl: null,
    mbol: null,
    house_bol: null,
    seal_number: null,
    chassis_number: null,
    container_size: null,
    scheduled_pickup: null,
    actual_pickup: null,
    actual_delivery: null,
    completed_date: null,
    created_at: null,
    is_hazmat: null,
    is_overweight: null,
    is_bonded: null,
    drivers: null,
    ...overrides,
  };
}
