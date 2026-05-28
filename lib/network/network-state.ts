import type { NetInfoState } from '@react-native-community/netinfo';

/** True when the device has no usable connection for API/Supabase calls. */
export function isOfflineFromNetInfo(state: NetInfoState): boolean {
  if (state.isConnected === false) {
    return true;
  }
  if (state.isInternetReachable === false) {
    return true;
  }
  return false;
}

const NETWORK_ERROR_PATTERN =
  /network request failed|failed to fetch|network error|econnrefused|enotfound|eai_again|timeout|aborted|cancelled|canceled/i;

/** True when React Query cancelled an in-flight request (e.g. device went offline). */
export function isQueryCancellation(error: unknown): boolean {
  if (!error) {
    return false;
  }
  if (error instanceof Error && error.name === 'AbortError') {
    return true;
  }
  const message =
    error instanceof Error ? error.message : typeof error === 'string' ? error : '';
  return /query was cancelled|cancelled|canceled/i.test(message);
}

/** Detects fetch/Supabase failures caused by missing connectivity or offline cancel. */
export function isNetworkFailure(error: unknown): boolean {
  if (!error) {
    return false;
  }
  if (isQueryCancellation(error)) {
    return true;
  }
  const message =
    error instanceof Error ? error.message : typeof error === 'string' ? error : '';
  return NETWORK_ERROR_PATTERN.test(message);
}
