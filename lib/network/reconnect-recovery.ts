/** Delay before refetching after NetInfo flaps back online (ms). */
export const RECONNECT_RECOVERY_DELAY_MS = 400;

export function shouldMarkOffline(isOffline: boolean): boolean {
  return isOffline;
}

export function shouldRunReconnectRecovery(
  wasOffline: boolean,
  isOffline: boolean,
  isRecovering: boolean,
): boolean {
  return wasOffline && !isOffline && !isRecovering;
}
