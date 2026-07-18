import type { SupabaseClient } from '@supabase/supabase-js';

import type { MobileDriverIdentity } from '@/lib/tms/mobile-driver-identity';

export type DriverByAuthResult = {
  driver: MobileDriverIdentity | null;
  errorMessage: string | null;
  /** false when row exists but mobile access is off */
  mobileEnabled: boolean | null;
};

/**
 * Truck-driver identity for the mobile app (RESPUESTAS):
 * `drivers.auth_user_id` + preferably `mobile_enabled`.
 */
export async function fetchDriverByAuthUserId(
  supabase: SupabaseClient,
  authUserId: string,
): Promise<DriverByAuthResult> {
  const { data, error } = await supabase
    .from('drivers')
    .select('id, name, username, mobile_enabled')
    .eq('auth_user_id', authUserId)
    .maybeSingle();

  if (error) {
    return { driver: null, errorMessage: error.message, mobileEnabled: null };
  }

  if (!data?.id) {
    return { driver: null, errorMessage: null, mobileEnabled: null };
  }

  const mobileEnabled =
    typeof data.mobile_enabled === 'boolean' ? data.mobile_enabled : null;

  if (mobileEnabled === false) {
    return { driver: null, errorMessage: null, mobileEnabled: false };
  }

  const username =
    typeof data.username === 'string' && data.username.trim()
      ? data.username.trim()
      : data.id;

  return {
    driver: {
      id: data.id,
      name:
        typeof data.name === 'string' && data.name.trim()
          ? data.name.trim()
          : username,
      username,
    },
    errorMessage: null,
    mobileEnabled,
  };
}
