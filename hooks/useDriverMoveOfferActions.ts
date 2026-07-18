import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useState } from 'react';

import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { strings } from '@/constants/strings';
import { getUserFacingMessage } from '@/lib/errors';
import type { DriverMoveCard } from '@/lib/loads/driver-move-card';
import { invalidateDriverLoads } from '@/lib/query/invalidate-loads';
import {
  mutateMobileDriverMoveOffer,
  type DriverMoveOfferAction,
} from '@/lib/tms/mutate-driver-move-offer';

type PendingMoveOffer = {
  moveId: string;
  action: DriverMoveOfferAction;
};

export type UseDriverMoveOfferActionsResult = {
  pending: PendingMoveOffer | null;
  error: string | null;
  successMessage: string | null;
  acceptMove: (card: DriverMoveCard, start: boolean) => void;
  rejectMove: (card: DriverMoveCard, reason?: string) => void;
  clearError: () => void;
  clearSuccess: () => void;
};

/**
 * Mutations for the C.1–C.2 move offer flow.
 */
export function useDriverMoveOfferActions(): UseDriverMoveOfferActionsResult {
  const queryClient = useQueryClient();
  const { session } = useAuth();
  const { assignedDriverId } = useProfile();
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async ({
      card,
      action,
      start,
      reason,
    }: {
      card: DriverMoveCard;
      action: DriverMoveOfferAction;
      start?: boolean;
      reason?: string;
    }) => {
      const result = await mutateMobileDriverMoveOffer({
        action,
        loadId: card.load_id,
        moveId: card.move_id,
        start,
        reason,
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
    onSuccess: async (_result, variables) => {
      if (variables.action === 'accept') {
        setSuccessMessage(
          variables.start
            ? strings.moveOffer.startedToast
            : strings.moveOffer.acceptedToast,
        );
      }
      if (assignedDriverId) {
        await invalidateDriverLoads(queryClient, assignedDriverId);
      }
    },
    onError: (mutationError) => {
      setError(getUserFacingMessage(mutationError));
    },
  });

  const submit = useCallback(
    (
      card: DriverMoveCard,
      action: DriverMoveOfferAction,
      start?: boolean,
      reason?: string,
    ) => {
      if (mutation.isPending) return;
      mutation.mutate({ card, action, start, reason });
    },
    [mutation],
  );
  const clearError = useCallback(() => setError(null), []);
  const clearSuccess = useCallback(() => setSuccessMessage(null), []);

  return {
    pending: mutation.isPending
      ? {
          moveId: mutation.variables.card.move_id,
          action: mutation.variables.action,
        }
      : null,
    error,
    successMessage,
    acceptMove: (card, start) => submit(card, 'accept', start),
    rejectMove: (card, reason) =>
      submit(card, 'reject', undefined, reason),
    clearError,
    clearSuccess,
  };
}
