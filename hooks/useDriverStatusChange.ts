import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useRef } from 'react';

import { useNetwork } from '@/context/NetworkContext';
import { useOfflineQueue } from '@/context/OfflineQueueContext';
import { useLoads } from '@/context/LoadsContext';
import { useAuth } from '@/hooks/useAuth';
import { runDriverStatusChange } from '@/lib/driver-status';
import { canDriverTransition } from '@/lib/loads';
import { MOCK_LOAD_TRANSITIONS } from '@/lib/loads/constants';
import { enqueueStatusChange } from '@/lib/offline/enqueue';
import { OfflineQueuedError } from '@/lib/offline/offline-queued-error';
import { strings } from '@/constants/strings';
import type { LoadTransitionMap } from '@/lib/tms/fetch-load-transitions';
import { rethrowIfTmsApiUnauthorized, resolveSupabaseAccessToken } from '@/lib/tms';
import { setLoadStatusInCache } from '@/lib/query/patch-load-status';
import type { LoadDetail, LoadStatus } from '@/types';

/**
 * TMS status change handler for load detail (optimistic when safe + telemetry).
 * Queues the change offline when there is no connectivity (task 9.4).
 */
export function useDriverStatusChange(
  load: LoadDetail | null,
  transitionMap: LoadTransitionMap = MOCK_LOAD_TRANSITIONS,
) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { updateLoadStatus } = useLoads();
  const { isOffline, isReady: networkReady } = useNetwork();
  const { refreshPendingCount } = useOfflineQueue();
  const inFlightRef = useRef(false);

  return useCallback(
    async (status: LoadStatus) => {
      if (!load || !user?.id) return;
      if (inFlightRef.current) return;
      if (status === load.status) return;
      if (!canDriverTransition(load.status, status, transitionMap)) return;

      inFlightRef.current = true;
      try {
        if (networkReady && isOffline) {
          await enqueueStatusChange({
            loadId: load.id,
            userId: user.id,
            previousStatus: load.status,
            targetStatus: status,
            activeHolds: load.active_holds,
          });
          setLoadStatusInCache(queryClient, user.id, load.id, status);
          updateLoadStatus(load.id, status);
          await refreshPendingCount();
          throw new OfflineQueuedError(strings.network.offlineStatusQueued);
        }

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
    [
      isOffline,
      load,
      networkReady,
      queryClient,
      refreshPendingCount,
      transitionMap,
      updateLoadStatus,
      user?.id,
    ],
  );
}
