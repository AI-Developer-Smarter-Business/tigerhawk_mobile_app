import {
  formatHoldLabel,
  getActiveHoldKeysFromLoad,
} from '@/lib/loads/active-holds';

describe('getActiveHoldKeysFromLoad', () => {
  it('returns empty when no holds active', () => {
    expect(getActiveHoldKeysFromLoad({})).toEqual([]);
    expect(
      getActiveHoldKeysFromLoad({
        freight_hold: null,
        carrier_hold: false,
      }),
    ).toEqual([]);
  });

  it('detects string holds with value hold', () => {
    expect(
      getActiveHoldKeysFromLoad({
        freight_hold: 'hold',
        customs_hold: 'hold',
        terminal_hold: 'clear',
      }),
    ).toEqual(['freight_hold', 'customs_hold']);
  });

  it('detects carrier_hold boolean', () => {
    expect(getActiveHoldKeysFromLoad({ carrier_hold: true })).toEqual([
      'carrier_hold',
    ]);
  });

  it('collects all active hold types', () => {
    expect(
      getActiveHoldKeysFromLoad({
        freight_hold: 'hold',
        terminal_hold: 'hold',
        fees_hold: 'hold',
        other_hold: 'hold',
        carrier_hold: true,
      }),
    ).toEqual([
      'freight_hold',
      'terminal_hold',
      'fees_hold',
      'other_hold',
      'carrier_hold',
    ]);
  });
});

describe('formatHoldLabel', () => {
  it('maps known hold keys to short labels', () => {
    expect(formatHoldLabel('freight_hold')).toBe('Freight');
    expect(formatHoldLabel('carrier_hold')).toBe('Carrier');
  });

  it('humanizes unknown keys', () => {
    expect(formatHoldLabel('custom_hold')).toBe('custom hold');
  });
});
