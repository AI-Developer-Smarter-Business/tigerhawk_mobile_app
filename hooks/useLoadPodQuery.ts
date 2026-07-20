import { useQuery } from '@tanstack/react-query';

import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import {
  getDriverQueryGateError,
  isDriverLoadsQueryEnabled,
} from '@/lib/query/driver-query-gate';
import { queryKeys } from '@/lib/query/query-keys';
import { getUserFacingMessage } from '@/lib/errors';
import type { LoadPodPreview } from '@/lib/loads/pod-preview';
import { fetchMobileLoadPod } from '@/lib/tms/fetch-load-pod';

export type UseLoadPodQueryResult = {
  preview: LoadPodPreview | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

/** Server-backed legal POD preview (TASKS G.1). */
export function useLoadPodQuery(
  loadId: string | undefined,
): UseLoadPodQueryResult {
  const { isSupabaseAuthenticated, isInitialized, session } = useAuth();
  const { isDriver, assignedDriverId, loading: profileLoading } = useProfile();
  const driverId = assignedDriverId ?? '';

  const gateError = getDriverQueryGateError({
    isSupabaseAuthenticated,
    profileLoading,
    isDriver,
  });

  const enabled =
    isDriverLoadsQueryEnabled({
      isInitialized,
      isSupabaseAuthenticated,
      profileLoading,
      isDriver,
      driverId,
    }) && Boolean(loadId);

  const query = useQuery({
    queryKey: queryKeys.loads.pod(driverId, loadId ?? ''),
    enabled,
    staleTime: 0,
    queryFn: async (): Promise<LoadPodPreview | null> => {
      const result = await fetchMobileLoadPod({
        loadId: loadId!,
        accessToken: session?.access_token,
      });
      if (!result.ok) {
        throw result.mobileError ?? new Error(result.error);
      }
      return result.preview;
    },
  });

  return {
    preview: query.data ?? null,
    loading:
      !loadId ||
      !isInitialized ||
      profileLoading ||
      (enabled && query.isPending && query.data === undefined),
    error: gateError ?? (query.error ? getUserFacingMessage(query.error) : null),
    refetch: async () => {
      await query.refetch();
    },
  };
}
