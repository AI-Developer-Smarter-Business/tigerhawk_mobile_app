/**
 * Phase A (WT.3): set EXPO_PUBLIC_WAIT_TIME_MOCK=1 — in-memory timer, no TMS API.
 * Phase B (default): TMS wait-time API.
 */
export function isWaitTimeMockMode(): boolean {
  return process.env.EXPO_PUBLIC_WAIT_TIME_MOCK === '1';
}
