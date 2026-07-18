import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';

import { useAuth } from '@/hooks/useAuth';
import { useNetwork } from '@/context/NetworkContext';
import { useOfflineQueue } from '@/context/OfflineQueueContext';
import {
  RECONNECT_RECOVERY_DELAY_MS,
  shouldRunReconnectRecovery,
} from '@/lib/network/reconnect-recovery';
import { processOfflineQueue } from '@/lib/offline';
import { safeLog } from '@/lib/logging/safe-log';

/**
 * Flushes the offline action queue after network recovery (task 9.4 / OFF.2).
 */
export function OfflineQueueProcessor() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { isOffline, isReady } = useNetwork();
  const { refreshPendingCount } = useOfflineQueue();
  const wasOfflineRef = useRef(false);
  const processingRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isReady || !user?.id) {
      return;
    }

    if (isOffline) {
      wasOfflineRef.current = true;
      processingRef.current = false;
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    if (!shouldRunReconnectRecovery(wasOfflineRef.current, isOffline, processingRef.current)) {
      return;
    }

    wasOfflineRef.current = false;
    processingRef.current = true;

    timerRef.current = setTimeout(() => {
      timerRef.current = null;

      void (async () => {
        try {
          const result = await processOfflineQueue({
            queryClient,
            userId: user.id,
          });
          if (result.processed > 0 || result.failed > 0) {
            safeLog.event('offline-queue', 'flush_complete', {
              processed: result.processed,
              failed: result.failed,
              remaining: result.remaining,
            });
          }
          await refreshPendingCount();
        } finally {
          processingRef.current = false;
        }
      })();
    }, RECONNECT_RECOVERY_DELAY_MS);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
        processingRef.current = false;
      }
    };
  }, [isOffline, isReady, queryClient, refreshPendingCount, user?.id]);

  return null;
}
