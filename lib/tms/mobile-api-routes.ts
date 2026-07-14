/**
 * Canonical `/api/mobile/*` path builders (RESPUESTAS_CLIENTE · TASKS A.0).
 * Single source for route strings used by the app and contract tests.
 */

export function encodeLoadId(loadId: string): string {
  return encodeURIComponent(loadId);
}

/** POST — username/password → Supabase session */
export const MOBILE_AUTH_LOGIN_PATH = '/api/mobile/auth/login';

/** GET current clock · POST `{ event: "in" | "out" }` */
export const MOBILE_DRIVER_CLOCK_PATH = '/api/mobile/driver/clock';

/** GET `{ active, upcoming }` move cards */
export const MOBILE_DRIVER_LOADS_PATH = '/api/mobile/driver/loads';

export function mobileLoadProgressPath(loadId: string): string {
  return `/api/mobile/loads/${encodeLoadId(loadId)}/progress`;
}

export function mobileLoadDocumentsPath(loadId: string): string {
  return `/api/mobile/loads/${encodeLoadId(loadId)}/documents`;
}

export function mobileLoadPodPath(loadId: string): string {
  return `/api/mobile/loads/${encodeLoadId(loadId)}/pod`;
}

export function mobileLoadPodSignaturePath(loadId: string): string {
  return `/api/mobile/loads/${encodeLoadId(loadId)}/pod-signature`;
}

export function mobileLoadAcceptPath(loadId: string): string {
  return `/api/mobile/loads/${encodeLoadId(loadId)}/accept`;
}

export function mobileLoadRejectPath(loadId: string): string {
  return `/api/mobile/loads/${encodeLoadId(loadId)}/reject`;
}
