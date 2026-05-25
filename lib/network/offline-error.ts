/** Thrown when a data fetch runs while the device is offline (task 4.5). */
export class OfflineError extends Error {
  readonly code = 'OFFLINE' as const;

  constructor(message = 'No internet connection') {
    super(message);
    this.name = 'OfflineError';
  }
}
