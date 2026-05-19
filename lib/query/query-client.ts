import { QueryClient } from '@tanstack/react-query';

export function createAppQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60_000,
        gcTime: 5 * 60_000,
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  });
}

let appQueryClient: QueryClient | null = null;

export function getQueryClient(): QueryClient {
  if (!appQueryClient) {
    appQueryClient = createAppQueryClient();
  }
  return appQueryClient;
}

/** Jest / hot reload: reset singleton between tests. */
export function resetQueryClientForTests(): void {
  appQueryClient = null;
}
