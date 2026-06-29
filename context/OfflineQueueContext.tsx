import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { getOfflineQueueLength } from '@/lib/offline';

type OfflineQueueContextValue = {
  pendingCount: number;
  refreshPendingCount: () => Promise<void>;
};

const OfflineQueueContext = createContext<OfflineQueueContextValue>({
  pendingCount: 0,
  refreshPendingCount: async () => undefined,
});

export function OfflineQueueProvider({ children }: { children: ReactNode }) {
  const [pendingCount, setPendingCount] = useState(0);

  const refreshPendingCount = useCallback(async () => {
    const count = await getOfflineQueueLength();
    setPendingCount(count);
  }, []);

  useEffect(() => {
    void refreshPendingCount();
  }, [refreshPendingCount]);

  const value = useMemo(
    () => ({ pendingCount, refreshPendingCount }),
    [pendingCount, refreshPendingCount],
  );

  return (
    <OfflineQueueContext.Provider value={value}>{children}</OfflineQueueContext.Provider>
  );
}

export function useOfflineQueue(): OfflineQueueContextValue {
  return useContext(OfflineQueueContext);
}
