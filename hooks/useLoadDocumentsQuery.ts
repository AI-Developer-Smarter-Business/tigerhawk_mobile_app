import { useQuery } from '@tanstack/react-query';
import { useCallback } from 'react';

import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { getUserFacingMessage } from '@/lib/errors';
import {
  getDriverQueryGateError,
  isDriverLoadsQueryEnabled,
} from '@/lib/query/driver-query-gate';
import { queryKeys } from '@/lib/query/query-keys';
import { fetchLoadDocumentsForDriver } from '@/lib/supabase/queries/fetch-load-documents';
import { getSupabase } from '@/lib/supabase/client';
import type { LoadDocument } from '@/types/load-document';

export type UseLoadDocumentsQueryResult = {
  documents: LoadDocument[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  retry: () => Promise<void>;
};

export function useLoadDocumentsQuery(loadId: string | undefined): UseLoadDocumentsQueryResult {
  const { user, isSupabaseAuthenticated, isInitialized } = useAuth();
  const { profile, isDriver, loading: profileLoading } = useProfile();
  const userId = user?.id ?? '';

  const gateError = getDriverQueryGateError({
    isSupabaseAuthenticated,
    profileLoading,
    isDriver,
    hasProfile: profile != null,
  });

  const enabled =
    Boolean(loadId) &&
    isDriverLoadsQueryEnabled({
      isSupabaseAuthenticated,
      profileLoading,
      isDriver,
      isInitialized,
      userId,
    });

  const query = useQuery({
    queryKey: loadId ? queryKeys.loads.documents(userId, loadId) : ['disabled'],
    enabled: enabled && Boolean(loadId),
    queryFn: async () => {
      const supabase = getSupabase();
      const result = await fetchLoadDocumentsForDriver(supabase, loadId!);
      if (result.errorMessage) {
        throw new Error(result.errorMessage);
      }
      return result.documents;
    },
  });

  const refetch = useCallback(async () => {
    await query.refetch();
  }, [query]);

  const error =
    gateError ??
    (query.error ? getUserFacingMessage(query.error) : null);

  return {
    documents: query.data ?? [],
    loading: query.isLoading && !query.data,
    refreshing: query.isFetching && !query.isLoading,
    error,
    refetch,
    retry: refetch,
  };
}
