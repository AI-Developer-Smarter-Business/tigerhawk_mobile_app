import { useQuery } from '@tanstack/react-query';

import { useAuth } from '@/hooks/useAuth';
import { MOCK_LOAD_TRANSITIONS } from '@/lib/loads/constants';
import { queryKeys } from '@/lib/query/query-keys';
import { fetchLoadTransitions, type LoadTransitionMap } from '@/lib/tms/fetch-load-transitions';
import { resolveSupabaseAccessToken } from '@/lib/tms';

const TRANSITIONS_STALE_MS = 5 * 60_000;

export function useLoadTransitionsQuery(): {
  transitionMap: LoadTransitionMap;
  loading: boolean;
} {
  const { user } = useAuth();
  const userId = user?.id ?? 'anonymous';

  const query = useQuery({
    queryKey: queryKeys.transitions(userId),
    queryFn: async () => {
      const token = await resolveSupabaseAccessToken();
      return fetchLoadTransitions(token);
    },
    enabled: Boolean(user?.id),
    staleTime: TRANSITIONS_STALE_MS,
    placeholderData: MOCK_LOAD_TRANSITIONS,
  });

  return {
    transitionMap: query.data ?? MOCK_LOAD_TRANSITIONS,
    loading: query.isLoading && !query.data,
  };
}
