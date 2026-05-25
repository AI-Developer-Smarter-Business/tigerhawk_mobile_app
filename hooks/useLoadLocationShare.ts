import { useCallback, useState } from 'react';

import { strings } from '@/constants/strings';
import { mapLocationError } from '@/lib/errors/map-location-error';
import type { UserFacingError } from '@/lib/errors/types';
import {
  getForegroundPosition,
  type ForegroundPosition,
} from '@/lib/location/get-foreground-position';
import { LocationError } from '@/lib/location/location-errors';
import { shareLoadLocation } from '@/lib/location/share-load-location';
import { formatReference } from '@/lib/loads/format';

type UseLoadLocationShareParams = {
  loadReference: string | null | undefined;
};

export function useLoadLocationShare({ loadReference }: UseLoadLocationShareParams) {
  const [position, setPosition] = useState<ForegroundPosition | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<UserFacingError | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);

  const shareLocation = useCallback(async () => {
    setLoading(true);
    setError(null);
    setPermissionDenied(false);

    try {
      const coords = await getForegroundPosition();
      setPosition(coords);

      const refLabel = loadReference?.trim()
        ? formatReference(loadReference.trim())
        : strings.loadDetail.emDash;

      await shareLoadLocation({
        loadReference: refLabel,
        latitude: coords.latitude,
        longitude: coords.longitude,
        accuracyMeters: coords.accuracyMeters,
        timestamp: coords.timestamp,
      });
    } catch (err) {
      if (err instanceof LocationError && err.code === 'PERMISSION_DENIED') {
        setPermissionDenied(true);
      }
      setError(mapLocationError(err));
    } finally {
      setLoading(false);
    }
  }, [loadReference]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    position,
    loading,
    error,
    permissionDenied,
    shareLocation,
    clearError,
  };
}
