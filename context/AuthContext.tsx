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
import { isEmailLoginIdentifier } from '@/lib/auth/login-identifier';
import { strings } from '@/constants/strings';
import { mapErrorToUserFacing } from '@/lib/errors';
import { safeLog } from '@/lib/logging/safe-log';
import {
  fetchInitialSession,
  subscribeToAuthChanges,
} from '@/lib/supabase/auth-session';
import { getSupabase } from '@/lib/supabase/client';
import { syncSupabaseRealtimeAuth } from '@/lib/supabase/realtime/sync-realtime-auth';
import type { MobileDriverIdentity } from '@/lib/tms/mobile-driver-identity';

export type AuthContextValue = {
  /** Terminó getSession inicial + suscripción al listener. */
  isInitialized: boolean;
  session: Session | null;
  user: User | null;
  /**
   * Driver row from `POST /api/mobile/auth/login` (username flow).
   * On cold start, ProfileContext may refill via `drivers.auth_user_id` (A.3).
   */
  mobileDriver: MobileDriverIdentity | null;
  /** Sesión Supabase activa (no incluye login mock del cliente). */
  isSupabaseAuthenticated: boolean;
  lastAuthEvent: AuthChangeEvent | null;
  initError: string | null;
  /** Re-ejecutar getSession (p. ej. desde pantalla Cuenta). */
  refreshSession: () => Promise<void>;
  /** Primary driver sign-in (TASKS A.2). Username → TMS; email (@) → Supabase until auth/login ships. */
  signInWithUsername: (
    usernameOrEmail: string,
    password: string,
  ) => Promise<{ ok: boolean; error?: string }>;
  /** Direct Supabase email/password (also used when identifier contains `@`). */
  signInWithPassword: (
    email: string,
    password: string,
  ) => Promise<{ ok: boolean; error?: string }>;
  /** @deprecated Forgot-password is contact dispatch; kept for rare recovery. */
  signInWithMagicLink: (email: string) => Promise<{ ok: boolean; error?: string }>;
  signOut: () => Promise<void>;
};
const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [mobileDriver, setMobileDriver] = useState<MobileDriverIdentity | null>(
    null,
  );
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
    setMobileDriver(null);
    return { ok: true };
  }, []);

  const signInWithUsername = useCallback(async (usernameOrEmail: string, password: string) => {
    const identifier = usernameOrEmail.trim();
    if (!identifier || !password) {
      return { ok: false, error: strings.auth.signInFailed };
    }

    // Bridge until TMS_fusion exposes POST /api/mobile/auth/login
    if (isEmailLoginIdentifier(identifier)) {
      return signInWithPassword(identifier, password);
    }

    const { loginMobileDriverWithUsername } = await import('@/lib/tms/mobile-auth-login');
    const login = await loginMobileDriverWithUsername({
      username: identifier,
      password,
    });
    if (!login.ok) {
      safeLog.authFailure('auth.signInWithUsername', login.error);
      if (login.mobileError?.httpStatus === 404) {
        return { ok: false, error: strings.auth.usernameApiNotDeployed };
      }
      // Login 401 must keep the API copy ("Incorrect username or password").
      // mapErrorToUserFacing remaps UNAUTHORIZED → "Sign in again to continue",
      // which is for mid-session expiry, not a failed sign-in.
      if (login.mobileError?.httpStatus === 401) {
        return { ok: false, error: login.error };
      }
      if (login.mobileError) {
        return {
          ok: false,
          error: mapErrorToUserFacing(login.mobileError).message,
        };
      }
      return { ok: false, error: login.error };
    }

    const supabase = getSupabase();
    const { error } = await supabase.auth.setSession({
      access_token: login.session.access_token,
      refresh_token: login.session.refresh_token,
    });
    if (error) {
      safeLog.authFailure('auth.setSession', error.message);
      setMobileDriver(null);
      return { ok: false, error: error.message };
    }

    setMobileDriver(login.driver);
    return { ok: true };
  }, [signInWithPassword]);

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
    setMobileDriver(null);
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
        setMobileDriver(null);
        setInitError(null);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!session?.access_token) {
      return;
    }
    void syncSupabaseRealtimeAuth(getSupabase());
  }, [session?.access_token]);

  const value = useMemo<AuthContextValue>(
    () => ({
      isInitialized,
      session,
      user: session?.user ?? null,
      mobileDriver,
      isSupabaseAuthenticated: session !== null,
      lastAuthEvent,
      initError,
      refreshSession,
      signInWithUsername,
      signInWithPassword,
      signInWithMagicLink,
      signOut,
    }),
    [
      isInitialized,
      session,
      mobileDriver,
      lastAuthEvent,
      initError,
      refreshSession,
      signInWithUsername,
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
