import type { SupabaseClient } from '@supabase/supabase-js';

/** Realtime RLS requires the user JWT on the websocket (Supabase JS v2+). */
export async function syncSupabaseRealtimeAuth(
  supabase: SupabaseClient,
): Promise<boolean> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) {
    return false;
  }
  await supabase.realtime.setAuth(token);
  return true;
}
