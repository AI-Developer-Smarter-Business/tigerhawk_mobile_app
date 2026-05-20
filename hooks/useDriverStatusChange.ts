import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

import { useLoads } from '@/context/LoadsContext';
import { useAuth } from '@/hooks/useAuth';
import { runDriverStatusChange } from '@/lib/driver-status';
import { TmsStatusChangeError } from '@/lib/tms';
import type { LoadDetail, LoadStatus } from '@/types';

/**
 * TMS status change handler for load detail (optimistic when safe + telemetry).
 */
export function useDriverStatusChange(load: LoadDetail | null) {
  const queryClient = useQueryClient();
  const { user, session } = useAuth();
  const { updateLoadStatus } = useLoads();

  return useCallback(
    async (status: LoadStatus) => {
      if (!load || !user?.id) return;

      const accessToken = session?.access_token;
      if (!accessToken) {
        throw new TmsStatusChangeError(
          'Session expired. Sign in again.',
          'UNAUTHORIZED',
        );
      }

      await runDriverStatusChange({
        queryClient,
        userId: user.id,
        load,
        targetStatus: status,
        accessToken,
        updateLoadStatus,
      });
    },
    [load, user?.id, session?.access_token, queryClient, updateLoadStatus],
  );
}
