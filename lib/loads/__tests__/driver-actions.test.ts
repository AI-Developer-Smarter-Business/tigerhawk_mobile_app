import { canDriverTransition, getDriverActionsForStatus } from '../driver-actions';

describe('getDriverActionsForStatus', () => {
  it('returns only driver-field transitions for Dispatched', () => {
    const actions = getDriverActionsForStatus('Dispatched');
    expect(actions).toContain('In Transit');
    expect(actions).not.toContain('Assigned');
  });

  it('returns empty for Completed', () => {
    expect(getDriverActionsForStatus('Completed')).toEqual([]);
  });
});

describe('canDriverTransition', () => {
  it('allows valid driver transition', () => {
    expect(canDriverTransition('Dispatched', 'In Transit')).toBe(true);
  });

  it('rejects dispatcher-only transition', () => {
    expect(canDriverTransition('Assigned', 'Dispatched')).toBe(false);
  });
});
