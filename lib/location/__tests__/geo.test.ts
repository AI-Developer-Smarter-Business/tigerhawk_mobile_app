import {
  assertValidCoordinates,
  distanceMeters,
  isValidCoordinatePair,
  isValidLatitude,
  isValidLongitude,
} from '../geo';
import { LocationError } from '../location-errors';

describe('geo helpers', () => {
  it('validates latitude and longitude ranges', () => {
    expect(isValidLatitude(29.76)).toBe(true);
    expect(isValidLatitude(91)).toBe(false);
    expect(isValidLongitude(-95.37)).toBe(true);
    expect(isValidLongitude(-181)).toBe(false);
    expect(isValidCoordinatePair(29.76, -95.37)).toBe(true);
  });

  it('assertValidCoordinates throws on invalid pair', () => {
    expect(() => assertValidCoordinates(100, 0)).toThrow(LocationError);
  });

  it('computes haversine distance in meters', () => {
    const houston = { latitude: 29.7604, longitude: -95.3698 };
    const nearby = { latitude: 29.77, longitude: -95.37 };
    const meters = distanceMeters(houston, nearby);
    expect(meters).toBeGreaterThan(0);
    expect(meters).toBeLessThan(5_000);
  });

  it('returns NaN distance for invalid coordinates', () => {
    expect(distanceMeters({ latitude: 999, longitude: 0 }, { latitude: 0, longitude: 0 })).toBeNaN();
  });
});
