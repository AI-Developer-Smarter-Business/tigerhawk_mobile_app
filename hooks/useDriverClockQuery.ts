import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { getUserFacingMessage } from '@/lib/errors';
import {
  getDriverQueryGateError,
  isDriverLoadsQueryEnabled,
} from '@/lib/query/driver-query-gate';
import { queryKeys } from '@/lib/query/query-keys';
import { fetchMobileDriverClock } from '@/lib/tms/fetch-driver-clock';
import type { DriverClockState } from '@/lib/tms/parse-driver-clock';

export type UseDriverClockQueryResult = {
  state: DriverClockState | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

/** Live duty clock from GET `/api/mobile/driver/clock` (TASKS I.2). */
export function useDriverClockQuery(): UseDriverClockQueryResult {
  const queryClient = useQueryClient();
  const { isSupabaseAuthenticated, isInitialized, session } = useAuth();
  const { isDriver, assignedDriverId, loading: profileLoading } = useProfile();
  const driverId = assignedDriverId ?? '';

  const gateError = getDriverQueryGateError({
    isSupabaseAuthenticated,
    profileLoading,
    isDriver,
  });

  const enabled = isDriverLoadsQueryEnabled({
    isInitialized,
    isSupabaseAuthenticated,
    profileLoading,
    isDriver,
    driverId,
  });

  const query = useQuery({
    queryKey: queryKeys.clock(driverId),
    enabled,
    staleTime: 0,
    queryFn: async (): Promise<DriverClockState> => {
      const result = await fetchMobileDriverClock({
        accessToken: session?.access_token,
      });
      if (!result.ok) {
        throw result.mobileError ?? new Error(result.error);
      }
      return result.state;
    },
  });

  const refetch = useCallback(async () => {
    if (!enabled) return;
    await queryClient.invalidateQueries({
      queryKey: queryKeys.clock(driverId),
    });
  }, [enabled, queryClient, driverId]);

  return {
    state: query.data ?? null,
    loading:
      !isInitialized ||
      profileLoading ||
      (enabled && query.isPending && query.data === undefined),
    error: gateError ?? (query.error ? getUserFacingMessage(query.error) : null),
    refetch,
  };
}
