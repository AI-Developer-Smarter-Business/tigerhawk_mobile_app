import { buildGoogleMapsUrl, openCoordinatesInMaps } from '../maps-url';

describe('buildGoogleMapsUrl', () => {
  it('builds query URL for valid coordinates', () => {
    const url = buildGoogleMapsUrl(29.76, -95.37);

    expect(url).toBe('https://maps.google.com/?q=29.76,-95.37');
    expect(url).not.toContain('/dir');
    expect(url).not.toContain('dir_action=navigate');
  });

  it('falls back when coordinates are invalid', () => {
    expect(buildGoogleMapsUrl(999, 0)).toBe('https://maps.google.com/');
  });

  it('opens the coordinate pin through the injected platform handler', async () => {
    const openUrl = jest.fn().mockResolvedValue(undefined);

    await openCoordinatesInMaps(29.76, -95.37, openUrl);

    expect(openUrl).toHaveBeenCalledWith(
      'https://maps.google.com/?q=29.76,-95.37',
    );
  });

  it('does not open maps for invalid coordinates', async () => {
    const openUrl = jest.fn();

    await expect(openCoordinatesInMaps(999, 0, openUrl)).rejects.toThrow(
      'invalid coordinates',
    );
    expect(openUrl).not.toHaveBeenCalled();
  });
});
