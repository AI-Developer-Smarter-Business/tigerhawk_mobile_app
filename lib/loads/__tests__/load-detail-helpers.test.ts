import {
  formatDisplayValue,
  hasContainerInfo,
  hasLoadFlags,
  hasShipmentInfo,
  hasTimeline,
} from '@/lib/loads/load-detail-helpers';
import type { LoadDetail } from '@/types';

function createLoadDetail(overrides: Partial<LoadDetail> = {}): LoadDetail {
  return {
    id: 'load-1',
    reference_number: 'THWK_1',
    status: 'Dispatched',
    container_number: null,
    pickup_location: null,
    delivery_location: null,
    return_location: null,
    pickup_apt_from: null,
    pickup_apt_to: null,
    delivery_apt_from: null,
    delivery_apt_to: null,
    is_hot: false,
    active_holds: [],
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
    ...overrides,
  };
}

describe('formatDisplayValue', () => {
  it('returns em dash for empty values', () => {
    expect(formatDisplayValue(null)).toBe('—');
    expect(formatDisplayValue('')).toBe('—');
    expect(formatDisplayValue('   ')).toBe('—');
  });

  it('returns trimmed text', () => {
    expect(formatDisplayValue('  Bayport  ')).toBe('Bayport');
  });
});

describe('hasShipmentInfo', () => {
  it('is false when shipment fields are empty', () => {
    expect(hasShipmentInfo(createLoadDetail())).toBe(false);
  });

  it('is true when any shipment field is set', () => {
    expect(hasShipmentInfo(createLoadDetail({ ssl: 'ZIM' }))).toBe(true);
  });
});

describe('hasContainerInfo', () => {
  it('detects container section fields', () => {
    expect(hasContainerInfo(createLoadDetail({ container_number: 'MSCU1' }))).toBe(
      true,
    );
    expect(hasContainerInfo(createLoadDetail())).toBe(false);
  });
});

describe('hasTimeline', () => {
  it('detects timeline timestamps', () => {
    expect(
      hasTimeline(createLoadDetail({ scheduled_pickup: '2026-05-19T08:00:00.000Z' })),
    ).toBe(true);
  });
});

describe('hasLoadFlags', () => {
  it('is true when any flag is set', () => {
    expect(hasLoadFlags(createLoadDetail({ is_hazmat: true }))).toBe(true);
    expect(hasLoadFlags(createLoadDetail())).toBe(false);
  });
});
