import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

import { useLoads } from '@/context/LoadsContext';
import { useAuth } from '@/hooks/useAuth';
import { runDriverStatusChange } from '@/lib/driver-status';
import { assertOnlineForDriverAction } from '@/lib/network/assert-online';
import { rethrowIfTmsApiUnauthorized, resolveSupabaseAccessToken } from '@/lib/tms';
import type { LoadDetail, LoadStatus } from '@/types';

/**
 * TMS status change handler for load detail (optimistic when safe + telemetry).
 */
export function useDriverStatusChange(load: LoadDetail | null) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { updateLoadStatus } = useLoads();

  return useCallback(
    async (status: LoadStatus) => {
      if (!load || !user?.id) return;

      await assertOnlineForDriverAction();

      const accessToken = await resolveSupabaseAccessToken();

      try {
        await runDriverStatusChange({
          queryClient,
          userId: user.id,
          load,
          targetStatus: status,
          accessToken,
          updateLoadStatus,
        });
      } catch (err) {
        rethrowIfTmsApiUnauthorized(err);
      }
    },
    [load, user?.id, queryClient, updateLoadStatus],
  );
}
