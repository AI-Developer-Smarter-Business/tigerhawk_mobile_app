import type { ForegroundPosition } from './get-foreground-position';
import { LocationError } from './location-errors';
import { canPersistLocationToTms } from './tms-location-integration';

export type PostDriverLocationParams = {
  loadId: string;
  position: ForegroundPosition;
  accessToken: string;
};

/**
 * Persists a one-shot GPS fix to TMS when `canPersistLocationToTms()` is true.
 * v1 (May 2026): TMS has no deployed route — callers use Share sheet instead.
 * @see docs/GPS_TMS_INTEGRATION_5_3.md
 */
export async function postDriverLocationToTms(
  _params: PostDriverLocationParams,
): Promise<void> {
  if (!canPersistLocationToTms()) {
    throw new LocationError(
      'Location is not stored in TMS yet. Use Share location to send coordinates to dispatch.',
      'POLICY_VIOLATION',
    );
  }

  throw new LocationError(
    'TMS location API is enabled in config but not implemented in the mobile client.',
    'POLICY_VIOLATION',
  );
}
