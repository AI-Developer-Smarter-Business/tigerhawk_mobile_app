import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';

import { env } from '@/lib/config/env';

import { assertSupabaseAnonKey } from './assert-anon-key';

const ExpoSecureStoreAdapter = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};

let client: SupabaseClient | null = null;

/**
 * Browser/mobile Supabase client (TMS: `createBrowserClient` in `lib/supabase/client.ts`).
 *
 * - Uses **anon key** only (`env.supabaseAnonKey`).
 * - Session in **SecureStore** (never localStorage).
 * - No service role, admin client, or privileged server logic here.
 */
export function getSupabase(): SupabaseClient {
  if (!client) {
    assertSupabaseAnonKey(env.supabaseAnonKey);
    client = createClient(env.supabaseUrl, env.supabaseAnonKey, {
      auth: {
        storage: ExpoSecureStoreAdapter,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    });
  }
  return client;
}

/** @internal Resets singleton (unit tests only). */
export function resetSupabaseClientForTests(): void {
  client = null;
}
