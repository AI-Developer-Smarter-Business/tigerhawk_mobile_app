import type { AuthChangeEvent, Session, User } from '@supabase/supabase-js';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { getAuthRedirectUri } from '@/lib/auth/redirect-uri';
import { safeLog } from '@/lib/logging/safe-log';
import {
  fetchInitialSession,
  subscribeToAuthChanges,
} from '@/lib/supabase/auth-session';
import { getSupabase } from '@/lib/supabase/client';

export type AuthContextValue = {
  /** Terminó getSession inicial + suscripción al listener. */
  isInitialized: boolean;
  session: Session | null;
  user: User | null;
  /** Sesión Supabase activa (no incluye login mock del cliente). */
  isSupabaseAuthenticated: boolean;
  lastAuthEvent: AuthChangeEvent | null;
  initError: string | null;
  /** Re-ejecutar getSession (p. ej. desde pantalla Cuenta). */
  refreshSession: () => Promise<void>;
  signInWithPassword: (
    email: string,
    password: string,
  ) => Promise<{ ok: boolean; error?: string }>;
  signInWithMagicLink: (email: string) => Promise<{ ok: boolean; error?: string }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [lastAuthEvent, setLastAuthEvent] = useState<AuthChangeEvent | null>(null);
  const [initError, setInitError] = useState<string | null>(null);

  const refreshSession = useCallback(async () => {
    const supabase = getSupabase();
    const { session: next, errorMessage } = await fetchInitialSession(supabase);
    setSession(next);
    setInitError(errorMessage);
  }, []);

  const signInWithPassword = useCallback(async (email: string, password: string) => {
    const supabase = getSupabase();
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (error) {
      safeLog.authFailure('auth.signInWithPassword', error.message);
      return { ok: false, error: error.message };
    }
    return { ok: true };
  }, []);

  const signInWithMagicLink = useCallback(async (email: string) => {
    const supabase = getSupabase();
    const redirectTo = getAuthRedirectUri();
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: redirectTo },
    });
    if (error) {
      safeLog.authFailure('auth.signInWithOtp', error.message);
      return { ok: false, error: error.message };
    }
    return { ok: true };
  }, []);

  const signOut = useCallback(async () => {
    const supabase = getSupabase();
    await supabase.auth.signOut();
    setSession(null);
    setLastAuthEvent('SIGNED_OUT');
  }, []);

  useEffect(() => {
    const supabase = getSupabase();
    let mounted = true;

    const bootstrap = async () => {
      const { session: initial, errorMessage } = await fetchInitialSession(supabase);
      if (!mounted) return;
      setSession(initial);
      setInitError(errorMessage);
      setIsInitialized(true);
    };

    void bootstrap();

    const subscription = subscribeToAuthChanges(supabase, (event, nextSession) => {
      if (!mounted) return;
      setLastAuthEvent(event);
      setSession(nextSession);
      if (event === 'SIGNED_OUT') {
        setInitError(null);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      isInitialized,
      session,
      user: session?.user ?? null,
      isSupabaseAuthenticated: session !== null,
      lastAuthEvent,
      initError,
      refreshSession,
      signInWithPassword,
      signInWithMagicLink,
      signOut,
    }),
    [
      isInitialized,
      session,
      lastAuthEvent,
      initError,
      refreshSession,
      signInWithPassword,
      signInWithMagicLink,
      signOut,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
