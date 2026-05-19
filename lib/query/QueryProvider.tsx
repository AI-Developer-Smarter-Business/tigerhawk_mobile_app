import { QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState, type ReactNode } from 'react';

import { useAuth } from '@/hooks/useAuth';
import { getQueryClient } from '@/lib/query/query-client';

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

  return (
    <QueryClientProvider client={queryClient}>
      <QueryCacheAuthSync />
      {children}
    </QueryClientProvider>
  );
}
