import { postDriverLocationToTms } from '../post-driver-location';
import { LocationError } from '../location-errors';

describe('postDriverLocationToTms', () => {
  it('rejects when TMS tracking API is not available', async () => {
    await expect(
      postDriverLocationToTms({
        loadId: 'load-1',
        accessToken: 'token',
        position: {
          latitude: 29.76,
          longitude: -95.37,
          accuracyMeters: 10,
          timestamp: Date.now(),
        },
      }),
    ).rejects.toBeInstanceOf(LocationError);
  });
});
