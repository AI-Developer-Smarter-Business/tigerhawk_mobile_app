import type { AuthChangeEvent, Session, SupabaseClient } from '@supabase/supabase-js';

export type InitialSessionResult = {
  session: Session | null;
  errorMessage: string | null;
};

/** Lee la sesión persistida (SecureStore) al arrancar la app. */
export async function fetchInitialSession(
  supabase: SupabaseClient,
): Promise<InitialSessionResult> {
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    return { session: null, errorMessage: error.message };
  }
  return { session: data.session ?? null, errorMessage: null };
}

export type AuthSubscription = {
  unsubscribe: () => void;
};

/** Listener de cambios de auth (login, refresh, logout). */
export function subscribeToAuthChanges(
  supabase: SupabaseClient,
  onChange: (event: AuthChangeEvent, session: Session | null) => void,
): AuthSubscription {
  const { data } = supabase.auth.onAuthStateChange((event, session) => {
    onChange(event, session);
  });
  return { unsubscribe: () => data.subscription.unsubscribe() };
}
