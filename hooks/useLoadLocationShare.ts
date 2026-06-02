import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { AppState, type AppStateStatus } from 'react-native';

import { strings } from '@/constants/strings';
import { useProfile } from '@/hooks/useProfile';
import { mapLocationError } from '@/lib/errors/map-location-error';
import type { UserFacingError } from '@/lib/errors/types';
import type { LoadLocationShareContext } from '@/lib/location/format-coordinates';
import {
  getForegroundPosition,
  type ForegroundPosition,
} from '@/lib/location/get-foreground-position';
import { isLowPowerModeEnabled } from '@/lib/location/low-power-mode';
import { getForegroundPermissionSnapshot } from '@/lib/location/location-permission';
import { LocationError } from '@/lib/location/location-errors';
import { shareLoadLocation } from '@/lib/location/share-load-location';
import { formatReference } from '@/lib/loads/format';

type UseLoadLocationShareParams = LoadLocationShareContext;

export function useLoadLocationShare({
  loadReference,
  status,
  containerNumber,
  pickupLocation,
  deliveryLocation,
  driverName,
  driverPhone,
  driverEmail,
}: UseLoadLocationShareParams) {
  const { profile } = useProfile();
  const [position, setPosition] = useState<ForegroundPosition | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<UserFacingError | null>(null);
  const [needsLocationSettings, setNeedsLocationSettings] = useState(false);
  const [lowPowerHint, setLowPowerHint] = useState(false);

  const refreshLowPowerHint = useCallback(async () => {
    setLowPowerHint(await isLowPowerModeEnabled());
  }, []);

  const shareLocation = useCallback(async () => {
    setLoading(true);
    setError(null);
    setNeedsLocationSettings(false);

    try {
      await refreshLowPowerHint();
      const coords = await getForegroundPosition();
      setPosition(coords);

      const refLabel = loadReference?.trim()
        ? formatReference(loadReference.trim())
        : strings.loadDetail.emDash;

      const resolvedDriverName =
        driverName?.trim() || profile?.full_name?.trim() || null;
      const resolvedDriverEmail =
        driverEmail?.trim() || profile?.email?.trim() || null;

      await shareLoadLocation({
        loadReference: refLabel,
        status: status?.trim() || null,
        containerNumber: containerNumber?.trim() || null,
        pickupLocation: pickupLocation?.trim() || null,
        deliveryLocation: deliveryLocation?.trim() || null,
        driverName: resolvedDriverName,
        driverPhone: driverPhone?.trim() || null,
        driverEmail: resolvedDriverEmail,
        latitude: coords.latitude,
        longitude: coords.longitude,
        accuracyMeters: coords.accuracyMeters,
        timestamp: coords.timestamp,
      });
    } catch (err) {
      if (err instanceof LocationError && err.code === 'PERMISSION_DENIED') {
        setNeedsLocationSettings(true);
      }
      if (err instanceof LocationError && err.code === 'SERVICES_DISABLED') {
        setNeedsLocationSettings(true);
      }
      setError(mapLocationError(err));
    } finally {
      setLoading(false);
    }
  }, [
    loadReference,
    status,
    containerNumber,
    pickupLocation,
    deliveryLocation,
    driverName,
    driverPhone,
    driverEmail,
    profile?.full_name,
    profile?.email,
    refreshLowPowerHint,
  ]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /** Re-read permission/GPS services after Settings or background (no re-prompt). */
  const syncLocationFromDevice = useCallback(async () => {
    const [snap] = await Promise.all([getForegroundPermissionSnapshot(), refreshLowPowerHint()]);

    if (snap.granted && snap.servicesEnabled) {
      setNeedsLocationSettings(false);
      setError((prev) => {
        if (prev?.kind === 'permission' || prev?.kind === 'validation') {
          return null;
        }
        return prev;
      });
    }
  }, [refreshLowPowerHint]);

  useFocusEffect(
    useCallback(() => {
      void syncLocationFromDevice();
    }, [syncLocationFromDevice]),
  );

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (next: AppStateStatus) => {
      if (next === 'active') {
        void syncLocationFromDevice();
      }
    });
    return () => subscription.remove();
  }, [syncLocationFromDevice]);

  return {
    position,
    loading,
    error,
    needsLocationSettings,
    lowPowerHint,
    shareLocation,
    clearError,
  };
}
