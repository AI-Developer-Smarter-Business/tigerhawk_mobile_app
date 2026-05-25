import NetInfo, { type NetInfoState } from '@react-native-community/netinfo';
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { isOfflineFromNetInfo } from '@/lib/network/network-state';

type NetworkContextValue = {
  isOffline: boolean;
  isReady: boolean;
};

const NetworkContext = createContext<NetworkContextValue>({
  isOffline: false,
  isReady: false,
});

export function NetworkProvider({ children }: { children: ReactNode }) {
  const [snapshot, setSnapshot] = useState<NetInfoState | null>(null);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setSnapshot(state);
    });
    void NetInfo.fetch().then(setSnapshot);
    return unsubscribe;
  }, []);

  const value = useMemo<NetworkContextValue>(() => {
    if (!snapshot) {
      return { isOffline: false, isReady: false };
    }
    return {
      isOffline: isOfflineFromNetInfo(snapshot),
      isReady: true,
    };
  }, [snapshot]);

  return (
    <NetworkContext.Provider value={value}>{children}</NetworkContext.Provider>
  );
}

export function useNetwork(): NetworkContextValue {
  return useContext(NetworkContext);
}
