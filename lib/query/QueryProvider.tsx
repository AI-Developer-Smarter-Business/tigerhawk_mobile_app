import { QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState, type ReactNode } from 'react';

import { QueryNetworkRecovery } from '@/components/query/QueryNetworkRecovery';
import { useAuth } from '@/hooks/useAuth';
import { getQueryClient } from '@/lib/query/query-client';
import { setupReactQueryOnlineManager } from '@/lib/query/setup-online-manager';

function QueryCacheAuthSync() {
  const { isSupabaseAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isSupabaseAuthenticated) {
      queryClient.clear();
    }
  }, [isSupabaseAuthenticated, queryClient]);

  return null;
}

type QueryProviderProps = {
  children: ReactNode;
};

export function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(() => getQueryClient());

  useEffect(() => setupReactQueryOnlineManager(), []);

  return (
    <QueryClientProvider client={queryClient}>
      <QueryCacheAuthSync />
      <QueryNetworkRecovery />
      {children}
    </QueryClientProvider>
  );
}
