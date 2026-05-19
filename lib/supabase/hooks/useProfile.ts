import { useCallback, useEffect, useState } from 'react';

import { useAuth } from '@/lib/supabase/hooks/useAuth';
import { getSupabase } from '@/lib/supabase/client';
import { fetchUserProfile } from '@/lib/supabase/queries';
import type { UserProfile } from '@/types/profile';

export type UseProfileResult = {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  isDriver: boolean;
  refetch: () => Promise<void>;
};

/**
 * Driver/staff profile from `user_profiles` (RLS: own row only).
 * Aligned to TMS `useUserRole` — fetch after auth, cancel on unmount.
 */
export function useProfile(): UseProfileResult {
  const { user, isInitialized, isSupabaseAuthenticated } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!user?.id || !isSupabaseAuthenticated) {
      setProfile(null);
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const { profile: next, errorMessage } = await fetchUserProfile(
      getSupabase(),
      user.id,
    );

    setProfile(next);
    setError(errorMessage);
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
          setProfile(null);
          setError(null);
          setLoading(false);
        }
        return;
      }

      if (!cancelled) {
        setLoading(true);
        setError(null);
      }

      const { profile: next, errorMessage } = await fetchUserProfile(
        getSupabase(),
        user.id,
      );

      if (cancelled) {
        return;
      }

      setProfile(next);
      setError(errorMessage);
      setLoading(false);
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [isInitialized, user?.id, isSupabaseAuthenticated]);

  return {
    profile,
    loading: !isInitialized || loading,
    error,
    isDriver: profile?.role === 'driver',
    refetch,
  };
}
