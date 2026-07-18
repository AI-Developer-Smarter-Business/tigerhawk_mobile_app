import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, type RenderHookOptions } from '@testing-library/react-native';
import type { ReactNode } from 'react';

import { LoadsProvider } from '@/context/LoadsContext';
import type { LoadDetail } from '@/types';
import type { UserProfile } from '@/types/profile';

export const DRIVER_USER_ID = 'driver-user-uuid';

export function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
    },
  });
}

export const driverAuthState = {
  user: { id: DRIVER_USER_ID },
  isSupabaseAuthenticated: true,
  isInitialized: true,
  mobileDriver: null,
};

/** Identity for tests: `drivers.id` matches load `driver_id` filters (A.3). */
export const driverProfileState = {
  profile: null as UserProfile | null,
  linkedDriver: {
    id: DRIVER_USER_ID,
    name: 'Test Driver',
    username: 'thl-test',
  },
  isDriver: true,
  assignedDriverId: DRIVER_USER_ID,
  loading: false,
  error: null,
  refetch: async () => {},
};

type HookWrapperOptions = {
  initialLoads?: LoadDetail[];
  queryClient?: QueryClient;
};

export function createHookWrapper(options: HookWrapperOptions = {}) {
  const queryClient = options.queryClient ?? createTestQueryClient();

  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <LoadsProvider initialLoads={options.initialLoads ?? []}>{children}</LoadsProvider>
      </QueryClientProvider>
    );
  }

  return Wrapper;
}

export function renderDriverHook<Result, Props>(
  callback: (props: Props) => Result,
  options?: RenderHookOptions<Props> & HookWrapperOptions,
) {
  const { initialLoads, queryClient, ...renderOptions } = options ?? {};
  return renderHook(callback, {
    ...renderOptions,
    wrapper: createHookWrapper({ initialLoads, queryClient }),
  });
}
