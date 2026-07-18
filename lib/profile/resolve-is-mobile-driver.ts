import type { MobileDriverIdentity } from '@/lib/tms/mobile-driver-identity';

/**
 * Who may use driver screens (RESPUESTAS Q2 · TASKS A.3).
 *
 * Truck drivers have **no** `user_profiles` row. Gate on:
 * - `mobileDriver` from `POST /api/mobile/auth/login`, or
 * - `linkedDriver` from `drivers.auth_user_id` (+ `mobile_enabled`, enforced in the fetch).
 *
 * Never use `user_profiles.role === 'driver'` — that role means office staff in the TMS.
 */
export function resolveIsMobileDriver(params: {
  mobileDriver: MobileDriverIdentity | null;
  linkedDriver: MobileDriverIdentity | null;
}): boolean {
  return Boolean(params.mobileDriver || params.linkedDriver);
}

/** `loads.driver_id` FK → `drivers.id` (not `auth.users.id`). */
export function resolveAssignedDriverId(params: {
  mobileDriver: MobileDriverIdentity | null;
  linkedDriver: MobileDriverIdentity | null;
}): string | null {
  const id = params.mobileDriver?.id ?? params.linkedDriver?.id;
  if (typeof id !== 'string') return null;
  const trimmed = id.trim();
  return trimmed || null;
}
