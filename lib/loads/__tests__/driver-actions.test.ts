import {
  canDriverTransition,
  filterDriverFieldActions,
  getDriverActionsForStatus,
  isDriverFieldStatus,
  isFinalLoadStatus,
} from '../driver-actions';

describe('filterDriverFieldActions', () => {
  it('removes dispatcher-only and final statuses', () => {
    const filtered = filterDriverFieldActions([
      'Dispatched',
      'In Transit',
      'Completed',
      'Cancelled',
    ]);
    expect(filtered).toEqual(['In Transit']);
  });
});

describe('getDriverActionsForStatus', () => {
  it('returns only driver-field transitions for Dispatched', () => {
    const actions = getDriverActionsForStatus('Dispatched');
    expect(actions).toContain('In Transit');
    expect(actions).toContain('Arrived At Pickup');
    expect(actions).not.toContain('Assigned');
    expect(actions).not.toContain('Cancelled');
  });

  it('offers At delivery from In Transit', () => {
    const actions = getDriverActionsForStatus('In Transit');
    expect(actions).toContain('Arrived At Delivery');
  });

  it('allows recovery path Delivered → In Transit → At delivery', () => {
    expect(getDriverActionsForStatus('Delivered')).toContain('In Transit');
    expect(canDriverTransition('Delivered', 'In Transit')).toBe(true);
    expect(canDriverTransition('In Transit', 'Arrived At Delivery')).toBe(true);
  });

  it('does not offer Completed from Delivered', () => {
    const actions = getDriverActionsForStatus('Delivered');
    expect(actions).toContain('Enroute To Return Empty');
    expect(actions).not.toContain('Completed');
    expect(actions).not.toContain('Cancelled');
  });

  it('returns empty for Completed', () => {
    expect(getDriverActionsForStatus('Completed')).toEqual([]);
  });

  it('returns empty for Assigned (dispatcher-only next steps)', () => {
    expect(getDriverActionsForStatus('Assigned')).toEqual([]);
  });
});

describe('canDriverTransition', () => {
  it('allows valid driver transition', () => {
    expect(canDriverTransition('Dispatched', 'In Transit')).toBe(true);
  });

  it('rejects dispatcher-only transition', () => {
    expect(canDriverTransition('Assigned', 'Dispatched')).toBe(false);
  });

  it('rejects final transition from Delivered', () => {
    expect(canDriverTransition('Delivered', 'Completed')).toBe(false);
  });
});

describe('status helpers', () => {
  it('classifies driver field vs final', () => {
    expect(isDriverFieldStatus('In Transit')).toBe(true);
    expect(isDriverFieldStatus('Dispatched')).toBe(false);
    expect(isFinalLoadStatus('Completed')).toBe(true);
    expect(isFinalLoadStatus('In Transit')).toBe(false);
  });
});
