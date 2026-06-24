/** Formats a GPS ping timestamp for the live-tracking banner (locale time). */
export function formatLastSentAt(lastSentAtMs: number, nowMs = Date.now()): string {
  const elapsedMs = Math.max(0, nowMs - lastSentAtMs);
  if (elapsedMs < 60_000) {
    return 'Just now';
  }
  if (elapsedMs < 3_600_000) {
    const minutes = Math.floor(elapsedMs / 60_000);
    return `${minutes} min ago`;
  }
  return new Date(lastSentAtMs).toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });
}
