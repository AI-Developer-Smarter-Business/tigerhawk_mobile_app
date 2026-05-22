/** Stable React Query keys for PP2 mobile. */
export const queryKeys = {
  root: ['pp2'] as const,
  profile: (userId: string) => [...queryKeys.root, 'profile', userId] as const,
  loads: {
    all: (userId: string) => [...queryKeys.root, 'loads', userId] as const,
    list: (userId: string) => [...queryKeys.loads.all(userId), 'list'] as const,
    detail: (userId: string, loadId: string) =>
      [...queryKeys.loads.all(userId), 'detail', loadId] as const,
    documents: (userId: string, loadId: string) =>
      [...queryKeys.loads.all(userId), 'documents', loadId] as const,
  },
} as const;
