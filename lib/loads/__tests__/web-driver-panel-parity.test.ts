import {
  DRIVER_FIELD_STATUSES,
  FINAL_LOAD_STATUSES,
} from '../constants';
import {
  WEB_DRIVER_PANEL_FIELD_STATUSES,
  WEB_DRIVER_PANEL_FINAL_STATUSES,
} from '../web-panel-reference';

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
});
