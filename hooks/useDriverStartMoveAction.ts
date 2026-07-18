import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useState } from 'react';

import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { strings } from '@/constants/strings';
import { getUserFacingMessage } from '@/lib/errors';
import type { DriverMoveCard } from '@/lib/loads/driver-move-card';
import {
  invalidateDriverLoads,
  invalidateLoadProgress,
} from '@/lib/query/invalidate-loads';
import { mutateMobileDriverProgress } from '@/lib/tms/mutate-driver-progress';

export type UseDriverStartMoveActionResult = {
  pendingMoveId: string | null;
  error: string | null;
  successMessage: string | null;
  startMove: (card: DriverMoveCard) => void;
  clearError: () => void;
  clearSuccess: () => void;
};

/** Starts an accepted Upcoming move through the semantic progress API (C.3). */
export function useDriverStartMoveAction(): UseDriverStartMoveActionResult {
  const queryClient = useQueryClient();
  const { session } = useAuth();
  const { assignedDriverId } = useProfile();
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async (card: DriverMoveCard) => {
      const result = await mutateMobileDriverProgress({
        action: 'start_move',
        loadId: card.load_id,
        moveId: card.move_id,
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
    onSuccess: async (_result, card) => {
      setSuccessMessage(strings.moveOffer.startedToast);
      if (assignedDriverId) {
        await Promise.all([
          invalidateDriverLoads(queryClient, assignedDriverId),
          invalidateLoadProgress(queryClient, assignedDriverId, card.load_id),
        ]);
      }
    },
    onError: (mutationError) => {
      setError(getUserFacingMessage(mutationError));
    },
  });
  const clearError = useCallback(() => setError(null), []);
  const clearSuccess = useCallback(() => setSuccessMessage(null), []);

  return {
    pendingMoveId: mutation.isPending
      ? mutation.variables.move_id
      : null,
    error,
    successMessage,
    startMove: (card) => {
      if (!mutation.isPending) mutation.mutate(card);
    },
    clearError,
    clearSuccess,
  };
}
