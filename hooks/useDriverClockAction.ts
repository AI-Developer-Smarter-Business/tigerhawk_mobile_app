import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useState } from 'react';

import { strings } from '@/constants/strings';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { getUserFacingMessage } from '@/lib/errors';
import { queryKeys } from '@/lib/query/query-keys';
import {
  mutateMobileDriverClock,
  type DriverClockEvent,
} from '@/lib/tms/mutate-driver-clock';

export type UseDriverClockActionResult = {
  pending: boolean;
  error: string | null;
  successMessage: string | null;
  runEvent: (event: DriverClockEvent) => void;
  clearError: () => void;
  clearSuccess: () => void;
};

/**
 * POST clock in/out; invalidates GET clock query (TASKS I.2 / I.3).
 */
export function useDriverClockAction(): UseDriverClockActionResult {
  const queryClient = useQueryClient();
  const { session } = useAuth();
  const { assignedDriverId } = useProfile();
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async (event: DriverClockEvent) => {
      const result = await mutateMobileDriverClock({
        event,
        accessToken: session?.access_token,
      });
      if (!result.ok) {
        throw result.mobileError ?? new Error(result.error);
      }
      return result.result;
    },
    onMutate: () => {
      setError(null);
      setSuccessMessage(null);
    },
    onSuccess: async (result) => {
      setSuccessMessage(
        result.event === 'out'
          ? strings.clock.toastOutOffDuty
          : strings.clock.toastIn,
      );
      if (assignedDriverId) {
        await queryClient.invalidateQueries({
          queryKey: queryKeys.clock(assignedDriverId),
        });
      }
    },
    onError: (mutationError) => {
      setError(getUserFacingMessage(mutationError));
    },
  });

  return {
    pending: mutation.isPending,
    error,
    successMessage,
    runEvent: useCallback(
      (event: DriverClockEvent) => {
        if (!mutation.isPending) mutation.mutate(event);
      },
      [mutation],
    ),
    clearError: useCallback(() => setError(null), []),
    clearSuccess: useCallback(() => setSuccessMessage(null), []),
  };
}
