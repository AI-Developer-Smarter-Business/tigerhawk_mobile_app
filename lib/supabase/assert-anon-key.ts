/**
 * Ensures the bundled Supabase key is the public anon key, never service_role.
 * Decodes JWT payload without verifying signature (sufficient for client guard).
 */
export function assertSupabaseAnonKey(key: string): void {
  const parts = key.split('.');
  if (parts.length < 2) {
    return;
  }

  try {
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    const payload = JSON.parse(
      typeof atob !== 'undefined'
        ? atob(padded)
        : Buffer.from(padded, 'base64').toString('utf8'),
    ) as { role?: string };

    if (payload.role === 'service_role') {
      throw new Error(
        'SUPABASE_SERVICE_ROLE_KEY must not be used in the mobile app. Use EXPO_PUBLIC_SUPABASE_ANON_KEY only.',
      );
    }
  } catch (e) {
    if (e instanceof Error && e.message.includes('SERVICE_ROLE')) {
      throw e;
    }
    // Non-JWT or parse failure: skip (custom keys in tests)
  }
}
