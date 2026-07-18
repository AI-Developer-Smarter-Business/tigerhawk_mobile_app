/** Stable React Query keys for PP2 mobile. */
export const queryKeys = {
  root: ['pp2'] as const,
  profile: (userId: string) => [...queryKeys.root, 'profile', userId] as const,
  loads: {
    all: (userId: string) => [...queryKeys.root, 'loads', userId] as const,
    list: (userId: string) => [...queryKeys.loads.all(userId), 'list'] as const,
    /** Active/Upcoming move cards from `GET /api/mobile/driver/loads` (B.3). */
    mobileBuckets: (driverId: string) =>
      [...queryKeys.loads.all(driverId), 'mobile-buckets'] as const,
    /** Completed moves from `GET /api/mobile/driver/loads/history` (B.4). */
    mobileHistory: (
      driverId: string,
      from: string,
      to: string,
      search: string,
    ) =>
      [
        ...queryKeys.loads.all(driverId),
        'mobile-history',
        from,
        to,
        search,
      ] as const,
    /** `moveId` scopes multi-move detail fallbacks; omit/empty when unknown. */
    detail: (userId: string, loadId: string, moveId: string = '') =>
      [...queryKeys.loads.all(userId), 'detail', loadId, moveId] as const,
    progress: (driverId: string, loadId: string) =>
      [...queryKeys.loads.all(driverId), 'progress', loadId] as const,
    documents: (userId: string, loadId: string) =>
      [...queryKeys.loads.all(userId), 'documents', loadId] as const,
  },
} as const;
