import {
  dedupeLoadListRows,
  dedupeLoadsById,
  hasMoreDriverLoads,
  mapLoadDetailRowToDetail,
  mapLoadRowToDetail,
  mapLoadRowsToDetails,
} from '../map-load-row';
import { createLoadDetailRow, createLoadListRow } from './fixtures/load-list-row';

describe('mapLoadRowToDetail', () => {
  it('maps container and customer embeds', () => {
    const detail = mapLoadRowToDetail(
      createLoadListRow({
        containers: { container_number: 'MSCU123' },
        customers: { name: 'Acme' },
      }),
    );

    expect(detail.container_number).toBe('MSCU123');
    expect(detail.customer_name).toBe('Acme');
    expect(detail.active_holds).toEqual([]);
    expect(detail.load_type).toBeNull();
    expect(detail.is_hazmat).toBe(false);
  });

  it('uses first embed when PostgREST returns an array', () => {
    const detail = mapLoadRowToDetail(
      createLoadListRow({
        containers: [
          { container_number: 'FIRST' },
          { container_number: 'SECOND' },
        ],
        customers: [{ name: 'Primary' }, { name: 'Other' }],
      }),
    );

    expect(detail.container_number).toBe('FIRST');
    expect(detail.customer_name).toBe('Primary');
  });

  it('maps active holds from load columns', () => {
    const detail = mapLoadRowToDetail(
      createLoadListRow({
        freight_hold: 'hold',
        carrier_hold: true,
      }),
    );

    expect(detail.active_holds).toEqual(['freight_hold', 'carrier_hold']);
  });

  it('sets detail-only fields to null on list rows', () => {
    const detail = mapLoadRowToDetail(createLoadListRow());

    expect(detail.ssl).toBeNull();
    expect(detail.driver_name).toBeNull();
    expect(detail.bol_number).toBeNull();
  });
});

describe('mapLoadDetailRowToDetail', () => {
  it('maps detail fields and formatted customer address', () => {
    const detail = mapLoadDetailRowToDetail(
      createLoadDetailRow({
        reference_number: 'THWK_M138509',
        is_hot: true,
        notes: 'Gate code 1234',
        freight_hold: 'hold',
        load_type: 'Import',
        route_type: 'Local',
        ssl: 'MAEU',
        mbol: 'MBOL123',
        house_bol: 'HBOL1',
        seal_number: 'SEAL9',
        chassis_number: 'CH-44',
        container_size: '40',
        scheduled_pickup: '2026-05-19T08:00:00.000Z',
        is_hazmat: true,
        is_bonded: true,
        containers: {
          container_number: 'MSCU999',
          bol_number: 'BOL-1',
          size: '40HC',
          type: 'Dry',
          seal_number: 'SEAL-CTR',
        },
        customers: {
          name: 'Acme',
          phone: '555-0100',
          address: '100 Main St',
          city: 'Houston',
          state: 'TX',
          zip_code: '77001',
        },
        drivers: { name: 'Test Driver', phone: '555-9999' },
      }),
    );

    expect(detail.load_type).toBe('Import');
    expect(detail.ssl).toBe('MAEU');
    expect(detail.container_number).toBe('MSCU999');
    expect(detail.container_size).toBe('40');
    expect(detail.bol_number).toBe('BOL-1');
    expect(detail.seal_number).toBe('SEAL9');
    expect(detail.customer_address).toContain('Houston');
    expect(detail.driver_name).toBe('Test Driver');
    expect(detail.driver_phone).toBe('555-9999');
    expect(detail.is_hazmat).toBe(true);
    expect(detail.is_bonded).toBe(true);
    expect(detail.active_holds).toEqual(['freight_hold']);
  });

  it('prefers load seal_number over container seal', () => {
    const detail = mapLoadDetailRowToDetail(
      createLoadDetailRow({
        seal_number: 'LOAD-SEAL',
        containers: { container_number: 'X', seal_number: 'CTR-SEAL' },
      }),
    );

    expect(detail.seal_number).toBe('LOAD-SEAL');
  });
});

describe('mapLoadRowsToDetails', () => {
  it('maps each list row', () => {
    const rows = [
      createLoadListRow({ id: 'a', reference_number: 'A' }),
      createLoadListRow({ id: 'b', reference_number: 'B' }),
    ];

    const details = mapLoadRowsToDetails(rows);

    expect(details).toHaveLength(2);
    expect(details[0].id).toBe('a');
    expect(details[1].reference_number).toBe('B');
  });
});

describe('dedupeLoadListRows', () => {
  it('keeps one row per load id when embed fans out', () => {
    const rows = [
      createLoadListRow({ id: 'load-1', reference_number: 'THWK_A' }),
      createLoadListRow({ id: 'load-1', reference_number: 'THWK_A_DUP' }),
      createLoadListRow({ id: 'load-2', reference_number: 'THWK_B' }),
    ];
    const unique = dedupeLoadListRows(rows);
    expect(unique).toHaveLength(2);
    expect(unique[0].reference_number).toBe('THWK_A');
  });
});

describe('dedupeLoadsById', () => {
  it('dedupes flattened infinite-query pages', () => {
    const a = mapLoadRowToDetail(createLoadListRow({ id: 'x' }));
    const dup = mapLoadRowToDetail(createLoadListRow({ id: 'x' }));
    const b = mapLoadRowToDetail(createLoadListRow({ id: 'y' }));
    expect(dedupeLoadsById([a, dup, b])).toHaveLength(2);
  });
});

describe('hasMoreDriverLoads', () => {
  it('uses total count when available', () => {
    expect(
      hasMoreDriverLoads({
        page: 0,
        pageSize: 20,
        rowCount: 20,
        totalCount: 45,
      }),
    ).toBe(true);

    expect(
      hasMoreDriverLoads({
        page: 2,
        pageSize: 20,
        rowCount: 5,
        totalCount: 45,
      }),
    ).toBe(false);
  });

  it('returns false when page is empty', () => {
    expect(
      hasMoreDriverLoads({
        page: 0,
        pageSize: 20,
        rowCount: 0,
        totalCount: 0,
      }),
    ).toBe(false);
  });

  it('infers more pages from full page without count', () => {
    expect(
      hasMoreDriverLoads({
        page: 0,
        pageSize: 20,
        rowCount: 20,
        totalCount: null,
      }),
    ).toBe(true);

    expect(
      hasMoreDriverLoads({
        page: 0,
        pageSize: 20,
        rowCount: 3,
        totalCount: null,
      }),
    ).toBe(false);
  });
});
