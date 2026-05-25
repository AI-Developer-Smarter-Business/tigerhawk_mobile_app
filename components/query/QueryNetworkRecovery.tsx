import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';

import { useNetwork } from '@/context/NetworkContext';
import { useProfile } from '@/context/ProfileContext';

/**
 * On offline: cancel in-flight queries (avoids stuck RefreshControl spinners).
 * On reconnect: refresh profile then refetch active load queries once.
 */
export function QueryNetworkRecovery() {
  const queryClient = useQueryClient();
  const { isOffline, isReady } = useNetwork();
  const { refetch: refetchProfile } = useProfile();
  const wasOfflineRef = useRef(false);
  const recoveringRef = useRef(false);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    if (isOffline) {
      wasOfflineRef.current = true;
      void queryClient.cancelQueries();
      return;
    }

    if (!wasOfflineRef.current || recoveringRef.current) {
      return;
    }

    wasOfflineRef.current = false;
    recoveringRef.current = true;

    const recover = async () => {
      try {
        await refetchProfile();
        await queryClient.refetchQueries({ type: 'active' });
      } finally {
        recoveringRef.current = false;
      }
    };

    void recover();
  }, [isOffline, isReady, queryClient, refetchProfile]);

  return null;
}
