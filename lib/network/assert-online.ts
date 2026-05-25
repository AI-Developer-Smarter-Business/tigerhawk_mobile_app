import NetInfo from '@react-native-community/netinfo';

import { strings } from '@/constants/strings';

import { OfflineError } from './offline-error';
import { isOfflineFromNetInfo } from './network-state';

/**
 * Blocks fresh network calls when offline. Does not affect cached React Query data.
 */
export async function assertOnlineForFetch(): Promise<void> {
  const state = await NetInfo.fetch();
  if (isOfflineFromNetInfo(state)) {
    throw new OfflineError(strings.network.offlineFetchBlocked);
  }
}

/** Blocks TMS/field actions (status change, document open) while offline. */
export async function assertOnlineForDriverAction(): Promise<void> {
  const state = await NetInfo.fetch();
  if (isOfflineFromNetInfo(state)) {
    throw new OfflineError(strings.network.offlineActionBlocked);
  }
}
