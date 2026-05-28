import {
  canPersistLocationToTms,
  getTmsLocationPersistenceMode,
  TMS_LOCATION_INTEGRATION,
} from '../tms-location-integration';

describe('tms-location-integration', () => {
  it('documents no tracking API in TMS v1', () => {
    expect(TMS_LOCATION_INTEGRATION.hasTrackingApi).toBe(false);
    expect(getTmsLocationPersistenceMode()).toBe('share_only');
    expect(canPersistLocationToTms()).toBe(false);
  });

  it('lists audited routes with reasons', () => {
    expect(TMS_LOCATION_INTEGRATION.auditedRoutes.length).toBeGreaterThanOrEqual(4);
    const messages = TMS_LOCATION_INTEGRATION.auditedRoutes.find((r) =>
      r.path.includes('messages'),
    );
    expect(messages?.suitableForGps).toBe(false);
  });
});
