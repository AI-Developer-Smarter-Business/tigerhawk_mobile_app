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
  const basePayload = {
    loadReference: '#TH-100',
    latitude: 29.76,
    longitude: -95.37,
    accuracyMeters: 10,
    timestamp: Date.now(),
  };

  it('includes load reference, coordinates, accuracy, maps link, and footer', () => {
    const message = buildLoadLocationShareMessage(basePayload);
    expect(message).toContain('Load: #TH-100');
    expect(message).toContain('29.760000, -95.370000');
    expect(message).toContain('±10 m');
    expect(message).toContain('https://maps.google.com/?q=29.76,-95.37');
    expect(message).toContain('Tigerhawk Mobile');
  });

  it('includes load, route, and driver fields when provided', () => {
    const message = buildLoadLocationShareMessage({
      ...basePayload,
      status: 'In Transit',
      containerNumber: 'MSCU123',
      pickupLocation: 'Bayport Terminal',
      deliveryLocation: 'Southern Star',
      driverName: 'John Driver',
      driverPhone: '555-0100',
      driverEmail: 'john@test.com',
    });

    expect(message).toContain('Status: In Transit');
    expect(message).toContain('Container: MSCU123');
    expect(message).toContain('Route: Bayport Terminal → Southern Star');
    expect(message).toContain('Driver: John Driver');
    expect(message).toContain('Driver phone: 555-0100');
    expect(message).toContain('Driver email: john@test.com');
  });

  it('omits empty optional fields', () => {
    const message = buildLoadLocationShareMessage(basePayload);
    expect(message).not.toContain('Driver:');
    expect(message).not.toContain('Container:');
    expect(message).not.toContain('Route:');
  });
});
