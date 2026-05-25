import { buildLoadLocationShareMessage, formatAccuracyMeters, formatCoordinates } from '../format-coordinates';

describe('formatCoordinates', () => {
  it('formats lat/lng to six decimals', () => {
    expect(
      formatCoordinates({ latitude: 29.760427, longitude: -95.369804 }),
    ).toBe('29.760427, -95.369804');
  });
});

describe('formatAccuracyMeters', () => {
  it('returns null for missing accuracy', () => {
    expect(formatAccuracyMeters(null)).toBeNull();
    expect(formatAccuracyMeters(undefined)).toBeNull();
  });

  it('rounds to whole meters', () => {
    expect(formatAccuracyMeters(12.4)).toBe('±12 m');
  });
});

describe('buildLoadLocationShareMessage', () => {
  it('includes load reference, coordinates, accuracy, and footer', () => {
    const message = buildLoadLocationShareMessage({
      loadReference: '#TH-100',
      latitude: 29.76,
      longitude: -95.37,
      accuracyMeters: 10,
      timestamp: Date.now(),
    });
    expect(message).toContain('#TH-100');
    expect(message).toContain('29.760000, -95.370000');
    expect(message).toContain('±10 m');
    expect(message).toContain('Tigerhawk Mobile');
  });
});
