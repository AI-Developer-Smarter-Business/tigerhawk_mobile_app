import { useQuery } from '@tanstack/react-query';
import { useCallback } from 'react';

import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { getUserFacingMessage } from '@/lib/errors';
import { normalizeLoadIdParam } from '@/lib/loads/document-load-association';
import {
    getDriverQueryGateError,
    isDriverLoadsQueryEnabled,
} from '@/lib/query/driver-query-gate';
import { queryKeys } from '@/lib/query/query-keys';
import { getSupabase } from '@/lib/supabase/client';
import { fetchDriverLoadDocuments } from '@/lib/supabase/queries/fetch-driver-load-documents';
import type { LoadDocument } from '@/types/load-document';

export type UseLoadDocumentsQueryResult = {
  documents: LoadDocument[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  refetch: () => Promise<LoadDocument[]>;
  retry: () => Promise<LoadDocument[]>;
};

export function useLoadDocumentsQuery(
  loadId: string | undefined,
): UseLoadDocumentsQueryResult {
  const { isSupabaseAuthenticated, isInitialized } = useAuth();
  const { isDriver, assignedDriverId, loading: profileLoading } = useProfile();
  const driverId = assignedDriverId ?? '';
  const effectiveLoadId = normalizeLoadIdParam(loadId) ?? undefined;

  const gateError = getDriverQueryGateError({
    isSupabaseAuthenticated,
    profileLoading,
    isDriver,
  });

  const enabled =
    Boolean(effectiveLoadId) &&
    isDriverLoadsQueryEnabled({
      isSupabaseAuthenticated,
      profileLoading,
      isDriver,
      isInitialized,
      driverId,
    });

  const query = useQuery({
    queryKey: effectiveLoadId
      ? queryKeys.loads.documents(driverId, effectiveLoadId)
      : ['disabled'],
    enabled: enabled && Boolean(effectiveLoadId),
    staleTime: 0,
    queryFn: async () => {
      const supabase = getSupabase();
      const result = await fetchDriverLoadDocuments(supabase, effectiveLoadId!);
      if (result.errorMessage) {
        throw new Error(result.errorMessage);
      }
      return result.documents;
    },
  });

  const refetch = useCallback(async (): Promise<LoadDocument[]> => {
    const result = await query.refetch();
    return result.data ?? [];
  }, [query]);

  const error =
    gateError ?? (query.error ? getUserFacingMessage(query.error) : null);

  return {
    documents: query.data ?? [],
    loading: query.isLoading && !query.data,
    refreshing: enabled && query.isRefetching,
    error,
    refetch,
    retry: refetch,
  };
}
