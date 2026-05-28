import { useCallback, useRef, useState } from 'react';

/** Safety cap so a cancelled offline request cannot leave RefreshControl spinning. */
export const PULL_REFRESH_MAX_MS = 45_000;

/**
 * RefreshControl must only reflect a user pull — not background refetches
 * (reconnect, focus, React Query refetchOnReconnect).
 */
export function usePullToRefresh(refresh: () => Promise<unknown>) {
  const [refreshing, setRefreshing] = useState(false);
  const watchdogRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stopRefreshing = useCallback(() => {
    if (watchdogRef.current) {
      clearTimeout(watchdogRef.current);
      watchdogRef.current = null;
    }
    setRefreshing(false);
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    watchdogRef.current = setTimeout(stopRefreshing, PULL_REFRESH_MAX_MS);

    void refresh()
      .catch(() => {
        /* Offline / network — still stop the spinner */
      })
      .finally(stopRefreshing);
  }, [refresh, stopRefreshing]);

  return { refreshing, onRefresh };
}
