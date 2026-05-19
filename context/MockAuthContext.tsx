import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

import { strings } from '@/constants/strings';
import { env } from '@/lib/config/env';
import { MOCK_DRIVER, MOCK_LOGIN } from '@/mocks';
import type { DriverProfile } from '@/types';

type MockAuthContextValue = {
  user: DriverProfile | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
};

const MockAuthContext = createContext<MockAuthContextValue | null>(null);

export function MockAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<DriverProfile | null>(null);

  const login = useCallback(async (email: string, password: string) => {
    if (!env.enableMockAuth) {
      return { ok: false, error: strings.auth.signInFailed };
    }
    const normalized = email.trim().toLowerCase();
    if (
      normalized === MOCK_LOGIN.email &&
      password === MOCK_LOGIN.password
    ) {
      setUser(MOCK_DRIVER);
      return { ok: true };
    }
    return { ok: false, error: strings.auth.invalidCredentials };
  }, []);

  const logout = useCallback(() => setUser(null), []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: user !== null,
      login,
      logout,
    }),
    [user, login, logout],
  );

  return <MockAuthContext.Provider value={value}>{children}</MockAuthContext.Provider>;
}

export function useMockAuth(): MockAuthContextValue {
  const ctx = useContext(MockAuthContext);
  if (!ctx) {
    throw new Error('useMockAuth must be used within MockAuthProvider');
  }
  return ctx;
}
