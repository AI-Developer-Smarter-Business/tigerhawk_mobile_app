import type { LoadStatus } from '@/types';

import {
  formatAppointment,
  formatAppointmentRange,
  formatLoadStatus,
  formatReference,
} from '../format';

describe('formatReference', () => {
  it('prefixes hash when missing', () => {
    expect(formatReference('TH-100')).toBe('#TH-100');
  });

  it('keeps existing hash', () => {
    expect(formatReference('#TH-100')).toBe('#TH-100');
  });
});

describe('formatLoadStatus', () => {
  const cases: [LoadStatus, string][] = [
    ['In Transit', 'In transit'],
    ['Arrived At Pickup', 'At pickup'],
    ['Arrived At Delivery', 'At delivery'],
    ['Delivered', 'Delivered'],
    ['Dispatched', 'Dispatched'],
    ['Assigned', 'Assigned'],
    ['Completed', 'Completed'],
    ['Cancelled', 'Cancelled'],
  ];

  it.each(cases)('maps %s to driver-facing label', (status, label) => {
    expect(formatLoadStatus(status)).toBe(label);
  });

  it('returns raw status when no label mapping exists', () => {
    expect(formatLoadStatus('At Warehouse')).toBe('At Warehouse');
  });
});

describe('formatAppointment', () => {
  it('returns fallback for null and invalid ISO', () => {
    expect(formatAppointment(null)).toBe('No appointment');
    expect(formatAppointment('not-a-date')).toBe('No appointment');
  });

  it('formats a valid ISO timestamp in en-US style', () => {
    const formatted = formatAppointment('2026-05-19T18:00:00.000Z');
    expect(formatted).not.toBe('No appointment');
    expect(formatted).toMatch(/May/);
    expect(formatted).toMatch(/\d/);
  });
});

describe('formatAppointmentRange', () => {
  it('returns fallback when both ends are missing', () => {
    expect(formatAppointmentRange(null, null)).toBe('No appointment');
  });

  it('returns single formatted value when only one end is set', () => {
    const onlyFrom = formatAppointmentRange('2026-05-19T08:00:00.000Z', null);
    expect(onlyFrom).toBe(formatAppointment('2026-05-19T08:00:00.000Z'));
  });

  it('joins distinct from and to values', () => {
    const range = formatAppointmentRange(
      '2026-05-19T08:00:00.000Z',
      '2026-05-19T16:00:00.000Z',
    );
    expect(range).toContain('–');
  });

  it('does not duplicate when start and end format the same', () => {
    const sameInstant = '2026-05-19T08:00:00.000Z';
    expect(formatAppointmentRange(sameInstant, sameInstant)).toBe(
      formatAppointment(sameInstant),
    );
  });
});
