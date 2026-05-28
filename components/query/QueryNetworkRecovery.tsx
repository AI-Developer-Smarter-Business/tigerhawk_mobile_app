import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';

import { useNetwork } from '@/context/NetworkContext';
import { useProfile } from '@/context/ProfileContext';
import {
  RECONNECT_RECOVERY_DELAY_MS,
  shouldRunReconnectRecovery,
} from '@/lib/network/reconnect-recovery';

/**
 * On offline: cancel in-flight queries (avoids stuck RefreshControl spinners).
 * On reconnect: refresh profile then refetch active load queries once (debounced).
 */
export function QueryNetworkRecovery() {
  const queryClient = useQueryClient();
  const { isOffline, isReady } = useNetwork();
  const { refetch: refetchProfile } = useProfile();
  const wasOfflineRef = useRef(false);
  const recoveringRef = useRef(false);
  const recoveryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    if (isOffline) {
      wasOfflineRef.current = true;
      recoveringRef.current = false;
      if (recoveryTimerRef.current) {
        clearTimeout(recoveryTimerRef.current);
        recoveryTimerRef.current = null;
      }
      void queryClient.cancelQueries();
      return;
    }

    if (!shouldRunReconnectRecovery(wasOfflineRef.current, isOffline, recoveringRef.current)) {
      return;
    }

    wasOfflineRef.current = false;
    recoveringRef.current = true;

    recoveryTimerRef.current = setTimeout(() => {
      recoveryTimerRef.current = null;

      const recover = async () => {
        try {
          await refetchProfile();
          await queryClient.refetchQueries({ type: 'active' });
        } finally {
          recoveringRef.current = false;
        }
      };

      void recover();
    }, RECONNECT_RECOVERY_DELAY_MS);

    return () => {
      if (recoveryTimerRef.current) {
        clearTimeout(recoveryTimerRef.current);
        recoveryTimerRef.current = null;
        recoveringRef.current = false;
      }
    };
  }, [isOffline, isReady, queryClient, refetchProfile]);

  return null;
}
