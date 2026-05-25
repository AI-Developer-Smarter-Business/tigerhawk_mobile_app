import { mapLocationError } from '../map-location-error';
import { LocationError } from '@/lib/location/location-errors';

describe('mapLocationError', () => {
  it('maps permission denied', () => {
    const result = mapLocationError(
      new LocationError('denied', 'PERMISSION_DENIED'),
    );
    expect(result.kind).toBe('permission');
  });

  it('maps unknown errors to generic share failed', () => {
    const result = mapLocationError(new Error('boom'));
    expect(result.kind).toBe('generic');
  });
});
