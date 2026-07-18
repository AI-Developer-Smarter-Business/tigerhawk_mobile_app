import { mapDriverMoveCardToLoadDetail } from '../map-driver-move-card-to-load-detail';
import type { DriverMoveCard } from '../driver-move-card';

function sampleCard(overrides: Partial<DriverMoveCard> = {}): DriverMoveCard {
  return {
    move_id: 'move-1',
    load_id: 'load-1',
    reference_number: 'THWK_100',
    load_type: 'Import',
    status: 'Dispatched',
    customer: 'Acme',
    container_number: 'CONT1',
    seal_number: 'SEAL1',
    container_size: '40',
    container_type: 'HC',
    chassis_number: 'CHS1',
    pickup_location: 'Port',
    delivery_location: 'Yard',
    return_location: 'Terminal',
    is_hazmat: true,
    is_hot: false,
    last_free_day: null,
    per_diem_free_day: null,
    cut_off_date: null,
    accepted_at: null,
    started_at: null,
    assigned_date: '2026-07-17T12:00:00.000Z',
    stops: [],
    progress: {
      label: 'Enroute To Pick Container',
      phase: 'enroute',
      active_move_id: 'move-1',
    },
    ...overrides,
  };
}

describe('mapDriverMoveCardToLoadDetail', () => {
  it('maps card fields used by the detail screen', () => {
    const detail = mapDriverMoveCardToLoadDetail(sampleCard());

    expect(detail.id).toBe('load-1');
    expect(detail.reference_number).toBe('THWK_100');
    expect(detail.status).toBe('Dispatched');
    expect(detail.customer_name).toBe('Acme');
    expect(detail.container_number).toBe('CONT1');
    expect(detail.seal_number).toBe('SEAL1');
    expect(detail.chassis_number).toBe('CHS1');
    expect(detail.pickup_location).toBe('Port');
    expect(detail.delivery_location).toBe('Yard');
    expect(detail.return_location).toBe('Terminal');
    expect(detail.is_hazmat).toBe(true);
    expect(detail.is_overweight).toBeNull();
    expect(detail.is_bonded).toBeNull();
    expect(detail.active_holds).toEqual([]);
  });

  it('does not invent a reference from move/load ids when missing', () => {
    const detail = mapDriverMoveCardToLoadDetail(
      sampleCard({ reference_number: null }),
    );
    expect(detail.reference_number).toBe('—');
  });

  it('uses progress label when status text is empty', () => {
    const detail = mapDriverMoveCardToLoadDetail(
      sampleCard({ status: '' }),
    );
    expect(detail.status).toBe('Enroute To Pick Container');
  });
});
