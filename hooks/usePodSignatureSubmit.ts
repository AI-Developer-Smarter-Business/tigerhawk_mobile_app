import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as Location from 'expo-location';
import { useCallback, useRef, useState } from 'react';

import { strings } from '@/constants/strings';
import { useAuth } from '@/hooks/useAuth';
import { useNetwork } from '@/context/NetworkContext';
import { useProfile } from '@/hooks/useProfile';
import { createClientSignatureId } from '@/lib/loads/create-client-signature-id';
import { OfflineQueuedError } from '@/lib/offline/offline-queued-error';
import { enqueuePodSignature } from '@/lib/offline/enqueue';
import { queryKeys } from '@/lib/query/query-keys';
import { getUserFacingMessage } from '@/lib/errors';
import { mutateMobilePodSignature } from '@/lib/tms/mutate-pod-signature';

export type PodSignatureSubmitInput = {
  signaturePng: string;
  signerName: string;
};

export type UsePodSignatureSubmitResult = {
  submitting: boolean;
  error: string | null;
  successMessage: string | null;
  submit: (input: PodSignatureSubmitInput) => Promise<boolean>;
  clearError: () => void;
  clearSuccess: () => void;
};

async function readOptionalCoordinates(): Promise<{
  latitude: number | null;
  longitude: number | null;
}> {
  try {
    const permission = await Location.getForegroundPermissionsAsync();
    if (permission.status !== 'granted') {
      return { latitude: null, longitude: null };
    }
    const position = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    return {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    };
  } catch {
    return { latitude: null, longitude: null };
  }
}

/**
 * Submits legal POD signature via POST …/pod-signature (G.2 / G.3).
 * Offline: queues with stable `client_signature_id` for G.5 retries.
 */
export function usePodSignatureSubmit(params: {
  loadId: string | undefined;
  moveId?: string;
}): UsePodSignatureSubmitResult {
  const queryClient = useQueryClient();
  const { session } = useAuth();
  const { assignedDriverId } = useProfile();
  const { isOffline, isReady: networkReady } = useNetwork();
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  /** Stable UUID for one capture session until success/queue. */
  const clientSignatureIdRef = useRef(createClientSignatureId());

  const mutation = useMutation({
    mutationFn: async (input: PodSignatureSubmitInput) => {
      if (!params.loadId) throw new Error('Load id is required.');
      const signerName = input.signerName.trim();
      if (!signerName) {
        throw new Error(strings.loadDetail.podSignerRequired);
      }

      const clientSignatureId = clientSignatureIdRef.current;
      const signedAt = new Date().toISOString();
      const coords = await readOptionalCoordinates();

      if (networkReady && isOffline) {
        if (!assignedDriverId) {
          throw new Error('Driver profile is required to queue a signature.');
        }
        await enqueuePodSignature({
          loadId: params.loadId,
          userId: assignedDriverId,
          clientSignatureId,
          signerName,
          signedAt,
          signaturePng: input.signaturePng,
          latitude: coords.latitude,
          longitude: coords.longitude,
          moveId: params.moveId,
        });
        throw new OfflineQueuedError(strings.loadDetail.podSignatureQueued);
      }

      const result = await mutateMobilePodSignature({
        loadId: params.loadId,
        clientSignatureId,
        signerName,
        signedAt,
        signaturePng: input.signaturePng,
        latitude: coords.latitude,
        longitude: coords.longitude,
        moveId: params.moveId,
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
    onSuccess: async (result) => {
      clientSignatureIdRef.current = createClientSignatureId();
      setSuccessMessage(
        result.stampPending
          ? strings.loadDetail.podSignaturePending
          : strings.loadDetail.podSignatureSigned,
      );
      if (assignedDriverId && params.loadId) {
        await queryClient.invalidateQueries({
          queryKey: queryKeys.loads.pod(assignedDriverId, params.loadId),
        });
      }
    },
    onError: (mutationError) => {
      if (mutationError instanceof OfflineQueuedError) {
        clientSignatureIdRef.current = createClientSignatureId();
        setSuccessMessage(mutationError.message);
        setError(null);
        return;
      }
      setError(getUserFacingMessage(mutationError));
    },
  });

  const submit = useCallback(
    async (input: PodSignatureSubmitInput) => {
      if (!params.loadId || mutation.isPending) return false;
      try {
        await mutation.mutateAsync(input);
        return true;
      } catch (err) {
        if (err instanceof OfflineQueuedError) return true;
        return false;
      }
    },
    [mutation, params.loadId],
  );

  return {
    submitting: mutation.isPending,
    error,
    successMessage,
    submit,
    clearError: useCallback(() => setError(null), []),
    clearSuccess: useCallback(() => setSuccessMessage(null), []),
  };
}
