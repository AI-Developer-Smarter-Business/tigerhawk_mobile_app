import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { useAuth } from '@/context/AuthContext';
import { applyProfileFetchResult } from '@/lib/profile/apply-profile-fetch-result';
import { getSupabase } from '@/lib/supabase/client';
import { fetchUserProfile } from '@/lib/supabase/queries';
import type { UserProfile } from '@/types/profile';

export type ProfileContextValue = {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  isDriver: boolean;
  refetch: () => Promise<void>;
};

const ProfileContext = createContext<ProfileContextValue | null>(null);

type ProfileState = {
  profile: UserProfile | null;
  error: string | null;
};

const emptyProfileState: ProfileState = { profile: null, error: null };

export function ProfileProvider({ children }: { children: ReactNode }) {
  const { user, isInitialized, isSupabaseAuthenticated } = useAuth();
  const [{ profile, error }, setProfileState] = useState<ProfileState>(emptyProfileState);
  const [loading, setLoading] = useState(false);

  const loadProfile = useCallback(async () => {
    if (!user?.id || !isSupabaseAuthenticated) {
      setProfileState(emptyProfileState);
      setLoading(false);
      return;
    }

    setLoading(true);
    setProfileState((prev) => ({ ...prev, error: null }));

    const result = await fetchUserProfile(getSupabase(), user.id);

    setProfileState((prev) => applyProfileFetchResult(prev.profile, result));
    setLoading(false);
  }, [user?.id, isSupabaseAuthenticated]);

  useEffect(() => {
    if (!isInitialized) {
      return;
    }

    let cancelled = false;

    const run = async () => {
      if (!user?.id || !isSupabaseAuthenticated) {
        if (!cancelled) {
          setProfileState(emptyProfileState);
          setLoading(false);
        }
        return;
      }

      if (!cancelled) {
        setLoading(true);
        setProfileState((prev) => ({ ...prev, error: null }));
      }

      const result = await fetchUserProfile(getSupabase(), user.id);

      if (cancelled) {
        return;
      }

      setProfileState((prev) => applyProfileFetchResult(prev.profile, result));
      setLoading(false);
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [isInitialized, user?.id, isSupabaseAuthenticated]);

  const value = useMemo<ProfileContextValue>(
    () => ({
      profile,
      loading: !isInitialized || loading,
      error,
      isDriver: profile?.role === 'driver',
      refetch: loadProfile,
    }),
    [profile, loading, error, isInitialized, loadProfile],
  );

  return (
    <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
  );
}

export function useProfile(): ProfileContextValue {
  const ctx = useContext(ProfileContext);
  if (!ctx) {
    throw new Error('useProfile must be used within ProfileProvider');
  }
  return ctx;
}
