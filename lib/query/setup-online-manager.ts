import NetInfo from '@react-native-community/netinfo';
import { onlineManager } from '@tanstack/react-query';

import { isOfflineFromNetInfo } from '@/lib/network/network-state';

/** Sync TanStack Query online state with NetInfo (React Native). */
export function setupReactQueryOnlineManager(): void {
  void NetInfo.fetch().then((state) => {
    onlineManager.setOnline(!isOfflineFromNetInfo(state));
  });

  onlineManager.setEventListener((setOnline) => {
    return NetInfo.addEventListener((state) => {
      setOnline(!isOfflineFromNetInfo(state));
    });
  });
}
