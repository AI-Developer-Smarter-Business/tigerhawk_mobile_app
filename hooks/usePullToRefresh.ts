import { useCallback, useState } from 'react';

/**
 * RefreshControl must only reflect a user pull — not background refetches
 * (reconnect, focus, React Query refetchOnReconnect).
 */
export function usePullToRefresh(refresh: () => Promise<unknown>) {
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    void refresh()
      .catch(() => {
        /* Offline / network — still stop the spinner */
      })
      .finally(() => {
        setRefreshing(false);
      });
  }, [refresh]);

  return { refreshing, onRefresh };
}
