import { buildGoogleMapsUrl } from '../maps-url';

describe('buildGoogleMapsUrl', () => {
  it('builds query URL for valid coordinates', () => {
    expect(buildGoogleMapsUrl(29.76, -95.37)).toBe('https://maps.google.com/?q=29.76,-95.37');
  });

  it('falls back when coordinates are invalid', () => {
    expect(buildGoogleMapsUrl(999, 0)).toBe('https://maps.google.com/');
  });
});
