import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useState } from 'react';

import { strings } from '@/constants/strings';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import type {
  DriverProgressAction,
  DriverProgressActionInput,
} from '@/lib/loads/driver-progress';
import {
  mapDriverProgressError,
  type DriverProgressError,
} from '@/lib/loads/driver-progress-error';
import {
  invalidateDriverLoads,
  invalidateLoadDetail,
  invalidateLoadProgress,
} from '@/lib/query/invalidate-loads';
import { mutateMobileDriverProgress } from '@/lib/tms/mutate-driver-progress';

export type UseDriverProgressActionResult = {
  pendingAction: DriverProgressAction | null;
  error: DriverProgressError | null;
  successMessage: string | null;
  runAction: (input: DriverProgressActionInput) => void;
  clearError: () => void;
  clearSuccess: () => void;
};

function successCopy(action: DriverProgressAction): string {
  switch (action) {
    case 'start_move':
      return strings.driverProgress.started;
    case 'enroute':
      return strings.driverProgress.enrouteSaved;
    case 'arrived':
      return strings.driverProgress.arrivalSaved;
    case 'complete':
      return strings.driverProgress.completed;
  }
}

/** Executes D.1 actions through POST `/progress`, never raw status PATCH. */
export function useDriverProgressAction(params: {
  loadId: string | undefined;
  moveId?: string;
}): UseDriverProgressActionResult {
  const queryClient = useQueryClient();
  const { session } = useAuth();
  const { assignedDriverId } = useProfile();
  const [error, setError] = useState<DriverProgressError | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async (input: DriverProgressActionInput) => {
      if (!params.loadId) throw new Error('Load id is required.');
      const result = await mutateMobileDriverProgress({
        action: input.action,
        loadId: params.loadId,
        moveId: params.moveId,
        chassisNumber: input.chassisNumber,
        containerNumber: input.containerNumber,
        sealNumber: input.sealNumber,
        note: input.note,
        accessToken: session?.access_token,
      });
      if (!result.ok) {
        throw result.mobileError ?? new Error(result.error);
      }
      return result;
    },
    onMutate: () => {
      setError(null);
      setSuccessMessage(null);
    },
    onSuccess: async (_result, input) => {
      setSuccessMessage(successCopy(input.action));
      if (assignedDriverId && params.loadId) {
        await Promise.all([
          invalidateDriverLoads(queryClient, assignedDriverId),
          invalidateLoadProgress(queryClient, assignedDriverId, params.loadId),
          invalidateLoadDetail(queryClient, assignedDriverId, params.loadId),
        ]);
      }
    },
    onError: async (mutationError) => {
      const mapped = mapDriverProgressError(mutationError);
      setError(mapped);

      if (
        mapped.appAction === 'refresh_list' &&
        assignedDriverId &&
        params.loadId
      ) {
        await Promise.all([
          invalidateDriverLoads(queryClient, assignedDriverId),
          invalidateLoadProgress(queryClient, assignedDriverId, params.loadId),
          invalidateLoadDetail(queryClient, assignedDriverId, params.loadId),
        ]);
      }
    },
  });

  const runAction = useCallback(
    (input: DriverProgressActionInput) => {
      if (!mutation.isPending && params.loadId) mutation.mutate(input);
    },
    [mutation, params.loadId],
  );
  const clearError = useCallback(() => setError(null), []);
  const clearSuccess = useCallback(() => setSuccessMessage(null), []);

  return {
    pendingAction: mutation.isPending
      ? mutation.variables.action
      : null,
    error,
    successMessage,
    runAction,
    clearError,
    clearSuccess,
  };
}
