import {
  formatMoveStopLocation,
  formatMoveStopStage,
} from '@/lib/loads/format-move-stop';

describe('formatMoveStopStage (B.2)', () => {
  it('maps PortPro-style stage titles', () => {
    expect(formatMoveStopStage('pickup_container')).toBe('PULL CONTAINER');
    expect(formatMoveStopStage('deliver_container')).toBe('DELIVER LOAD');
    expect(formatMoveStopStage('return_container')).toBe('RETURN CONTAINER');
  });

  it('humanizes unknown event types', () => {
    expect(formatMoveStopStage('custom_yard')).toBe('CUSTOM YARD');
  });
});

describe('formatMoveStopLocation (B.2)', () => {
  it('reads name/address objects', () => {
    expect(
      formatMoveStopLocation({
        name: 'BARBOURS CUT TERMINALS',
        address: '1515 E Barbours Cut Blvd',
        city: 'La Porte',
        state: 'TX',
        zip: '77571',
      }),
    ).toContain('BARBOURS CUT TERMINALS');
  });

  it('returns empty for missing location', () => {
    expect(formatMoveStopLocation(null)).toBe('');
  });
});
