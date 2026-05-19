/**
 * Public env vars for the mobile app (Expo).
 * Reads EXPO_PUBLIC_* with NEXT_PUBLIC_* fallback from shared .env.local.
 */
function requireEnv(name: string, value: string | undefined): string {
  if (!value?.trim()) {
    throw new Error(
      `Missing environment variable ${name}. See .env.local and README.md.`,
    );
  }
  return value.trim();
}

const isDev = typeof __DEV__ !== 'undefined' && __DEV__;

if (process.env.EXPO_PUBLIC_SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error(
    'Do not prefix the service role key with EXPO_PUBLIC_. Use scripts/ with SUPABASE_SERVICE_ROLE_KEY in .env.local only.',
  );
}

export const env = {
  supabaseUrl: requireEnv(
    'EXPO_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_URL',
    process.env.EXPO_PUBLIC_SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL,
  ),
  supabaseAnonKey: requireEnv(
    'EXPO_PUBLIC_SUPABASE_ANON_KEY / NEXT_PUBLIC_SUPABASE_ANON_KEY',
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ??
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  ),
  /** TMS Next.js base URL (optional BFF for app/api routes). */
  tmsApiUrl: (
    process.env.EXPO_PUBLIC_TMS_API_URL ??
    process.env.NEXT_PUBLIC_APP_URL ??
    ''
  ).replace(/\/$/, ''),
  /**
   * Mock login (legacy). Off by default — set EXPO_PUBLIC_ENABLE_MOCK_AUTH=1 to enable in dev.
   */
  enableMockAuth:
    isDev && process.env.EXPO_PUBLIC_ENABLE_MOCK_AUTH === '1',
} as const;
