/** Thrown when an action is saved to the offline queue instead of failing silently. */
export class OfflineQueuedError extends Error {
  readonly code = 'OFFLINE_QUEUED' as const;

  constructor(message: string) {
    super(message);
    this.name = 'OfflineQueuedError';
  }
}

export function isOfflineQueuedError(error: unknown): error is OfflineQueuedError {
  return error instanceof OfflineQueuedError;
}
