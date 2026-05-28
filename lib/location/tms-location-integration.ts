/**
 * TMS GPS persistence audit (task 5.3).
 * Update `hasTrackingApi` when the TMS deploys a dedicated driver-location POST.
 */
export type TmsLocationPersistenceMode = 'share_only' | 'tms_api';

export type TmsLocationRouteAudit = {
  method: 'GET' | 'POST' | 'PATCH';
  path: string;
  suitableForGps: boolean;
  reason: string;
};

/** Result of read-only TMS review (May 2026). */
export const TMS_LOCATION_INTEGRATION = {
  hasTrackingApi: false,
  v1PersistenceMode: 'share_only' as const satisfies TmsLocationPersistenceMode,
  aspirationalRoadmapRoute: '/api/tracking/loads/[id]/locations',
  proposedMobileRoute: '/api/dispatcher/loads/[id]/driver-location',
  auditedRoutes: [
    {
      method: 'POST',
      path: '/api/dispatcher/loads/[id]/documents',
      suitableForGps: false,
      reason: 'Multipart file upload (POD/Photo); not coordinates.',
    },
    {
      method: 'PATCH',
      path: '/api/dispatcher/loads/[id]/status',
      suitableForGps: false,
      reason: 'Load status transitions only.',
    },
    {
      method: 'PATCH',
      path: '/api/dispatcher/loads/[id]',
      suitableForGps: false,
      reason: 'Text fields (notes, pickup_location); unsafe to store GPS pings.',
    },
    {
      method: 'POST',
      path: '/api/dispatcher/loads/[id]/messages',
      suitableForGps: false,
      reason: 'Could embed coords in message body; no driver messages UI in v1.',
    },
    {
      method: 'POST',
      path: '/api/dispatcher/loads/[id]/wait-time',
      suitableForGps: false,
      reason: 'Wait/detention events; location is a place name, not a GPS fix.',
    },
  ] as const satisfies readonly TmsLocationRouteAudit[],
} as const;

export function getTmsLocationPersistenceMode(): TmsLocationPersistenceMode {
  return TMS_LOCATION_INTEGRATION.hasTrackingApi ? 'tms_api' : 'share_only';
}

export function canPersistLocationToTms(): boolean {
  return TMS_LOCATION_INTEGRATION.hasTrackingApi;
}
