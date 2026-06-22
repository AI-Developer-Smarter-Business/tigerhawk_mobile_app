import {
  DRIVER_FIELD_STATUSES,
  FINAL_LOAD_STATUSES,
  MOCK_LOAD_TRANSITIONS,
} from '../constants';
import { filterDriverFieldActions, getDriverActionsForStatus } from '../driver-actions';
import {
  filterWebDriverPanelActions,
  WEB_DRIVER_PANEL_FIELD_STATUSES,
  WEB_DRIVER_PANEL_FINAL_STATUSES,
} from '../web-panel-reference';
import type { LoadStatus } from '@/types';

describe('web DriverActionPanel parity (task 3.7)', () => {
  it('DRIVER_FIELD_STATUSES matches TMS DriverActionPanel DRIVER_STATUSES', () => {
    expect([...DRIVER_FIELD_STATUSES].sort()).toEqual(
      [...WEB_DRIVER_PANEL_FIELD_STATUSES].sort(),
    );
  });

  it('FINAL_LOAD_STATUSES matches TMS FINAL_STATUSES', () => {
    expect([...FINAL_LOAD_STATUSES].sort()).toEqual(
      [...WEB_DRIVER_PANEL_FINAL_STATUSES].sort(),
    );
  });

  it('filterDriverFieldActions matches web driverActions filter for every status', () => {
    const statuses = Object.keys(MOCK_LOAD_TRANSITIONS) as LoadStatus[];
    for (const status of statuses) {
      const next = MOCK_LOAD_TRANSITIONS[status] ?? [];
      const mobile = getDriverActionsForStatus(status, MOCK_LOAD_TRANSITIONS);
      const web = filterWebDriverPanelActions(next);
      expect(mobile).toEqual(web);
      expect(filterDriverFieldActions(next)).toEqual(web);
    }
  });

  it('Dispatched exposes same driver buttons as web (no Dispatched/Cancelled only)', () => {
    const mobile = getDriverActionsForStatus('Dispatched');
    expect(mobile).toContain('In Transit');
    expect(mobile).not.toContain('Cancelled');
    expect(mobile).not.toContain('Dispatched');
  });
});
