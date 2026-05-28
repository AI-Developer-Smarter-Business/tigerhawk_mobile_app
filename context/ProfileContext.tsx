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
import { isNetworkFailure } from '@/lib/network/network-state';
import { applyProfileFetchResult } from '@/lib/profile/apply-profile-fetch-result';
import { isProfileGateLoading } from '@/lib/profile/profile-gate-loading';
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

type LoadProfileOptions = {
  /** When true, do not block driver queries (reconnect / manual refresh). */
  background?: boolean;
};

export function ProfileProvider({ children }: { children: ReactNode }) {
  const { user, isInitialized, isSupabaseAuthenticated } = useAuth();
  const [{ profile, error }, setProfileState] = useState<ProfileState>(emptyProfileState);
  const [fetchInFlight, setFetchInFlight] = useState(false);

  const loadProfile = useCallback(
    async ({ background = false }: LoadProfileOptions = {}) => {
      if (!user?.id || !isSupabaseAuthenticated) {
        setProfileState(emptyProfileState);
        setFetchInFlight(false);
        return;
      }

      setFetchInFlight(true);
      if (!background) {
        setProfileState((prev) => ({ ...prev, error: null }));
      }

      try {
        const result = await fetchUserProfile(getSupabase(), user.id);
        setProfileState((prev) => applyProfileFetchResult(prev.profile, result));
      } catch (err) {
        setProfileState((prev) => {
          if (isNetworkFailure(err) && prev.profile) {
            return { profile: prev.profile, error: null };
          }
          const message = err instanceof Error ? err.message : 'Could not load profile.';
          return { profile: prev.profile, error: message };
        });
      } finally {
        setFetchInFlight(false);
      }
    },
    [user?.id, isSupabaseAuthenticated],
  );

  useEffect(() => {
    if (!isInitialized) {
      return;
    }

    let cancelled = false;

    const run = async () => {
      if (!user?.id || !isSupabaseAuthenticated) {
        if (!cancelled) {
          setProfileState(emptyProfileState);
          setFetchInFlight(false);
        }
        return;
      }

      if (!cancelled) {
        setFetchInFlight(true);
        setProfileState((prev) => ({ ...prev, error: null }));
      }

      try {
        const result = await fetchUserProfile(getSupabase(), user.id);

        if (cancelled) {
          return;
        }

        setProfileState((prev) => applyProfileFetchResult(prev.profile, result));
      } catch (err) {
        if (cancelled) {
          return;
        }
        setProfileState((prev) => {
          if (isNetworkFailure(err) && prev.profile) {
            return { profile: prev.profile, error: null };
          }
          const message = err instanceof Error ? err.message : 'Could not load profile.';
          return { profile: prev.profile, error: message };
        });
      } finally {
        if (!cancelled) {
          setFetchInFlight(false);
        }
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [isInitialized, user?.id, isSupabaseAuthenticated]);

  const value = useMemo<ProfileContextValue>(
    () => ({
      profile,
      loading: isProfileGateLoading(isInitialized, fetchInFlight, profile),
      error,
      isDriver: profile?.role === 'driver',
      refetch: () => loadProfile({ background: profile != null }),
    }),
    [profile, fetchInFlight, error, isInitialized, loadProfile],
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
