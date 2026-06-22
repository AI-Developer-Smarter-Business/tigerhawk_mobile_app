import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useRef } from 'react';

import { useLoads } from '@/context/LoadsContext';
import { useAuth } from '@/hooks/useAuth';
import { runDriverStatusChange } from '@/lib/driver-status';
import { canDriverTransition } from '@/lib/loads';
import { MOCK_LOAD_TRANSITIONS } from '@/lib/loads/constants';
import type { LoadTransitionMap } from '@/lib/tms/fetch-load-transitions';
import { assertOnlineForDriverAction } from '@/lib/network/assert-online';
import { rethrowIfTmsApiUnauthorized, resolveSupabaseAccessToken } from '@/lib/tms';
import type { LoadDetail, LoadStatus } from '@/types';

/**
 * TMS status change handler for load detail (optimistic when safe + telemetry).
 */
export function useDriverStatusChange(
  load: LoadDetail | null,
  transitionMap: LoadTransitionMap = MOCK_LOAD_TRANSITIONS,
) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { updateLoadStatus } = useLoads();
  const inFlightRef = useRef(false);

  return useCallback(
    async (status: LoadStatus) => {
      if (!load || !user?.id) return;
      if (inFlightRef.current) return;
      if (status === load.status) return;
      if (!canDriverTransition(load.status, status, transitionMap)) return;

      inFlightRef.current = true;
      try {
        await assertOnlineForDriverAction();

        const accessToken = await resolveSupabaseAccessToken();

        await runDriverStatusChange({
          queryClient,
          userId: user.id,
          load,
          targetStatus: status,
          accessToken,
          updateLoadStatus,
          transitionMap,
        });
      } catch (err) {
        rethrowIfTmsApiUnauthorized(err);
        throw err;
      } finally {
        inFlightRef.current = false;
      }
    },
    [load, user?.id, queryClient, updateLoadStatus, transitionMap],
  );
}
