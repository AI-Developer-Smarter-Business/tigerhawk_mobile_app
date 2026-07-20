import {
  parseDriverClockGetResponse,
  parseDriverClockPostResponse,
} from '@/lib/tms/parse-driver-clock';

describe('parse-driver-clock (I.2)', () => {
  it('parses GET clock state', () => {
    const parsed = parseDriverClockGetResponse({
      ok: true,
      driver_id: 'drv-1',
      driver_name: 'Alex',
      is_clocked_in: true,
      status: 'Available',
      last_clock_in_at: '2026-07-20T13:00:00.000Z',
      last_clock_out_at: null,
    });
    expect(parsed).toEqual({
      ok: true,
      state: {
        driverId: 'drv-1',
        driverName: 'Alex',
        isClockedIn: true,
        status: 'Available',
        lastClockInAt: '2026-07-20T13:00:00.000Z',
        lastClockOutAt: null,
      },
    });
  });

  it('parses POST clock out result', () => {
    const parsed = parseDriverClockPostResponse({
      ok: true,
      driver_id: 'drv-1',
      driver_name: 'Alex',
      event: 'out',
      is_clocked_in: false,
      status: 'Off Duty',
      previous_status: 'Available',
      occurred_at: '2026-07-20T18:00:00.000Z',
    });
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    expect(parsed.result.event).toBe('out');
    expect(parsed.result.isClockedIn).toBe(false);
  });

  it('rejects incomplete bodies', () => {
    expect(parseDriverClockGetResponse({ ok: true }).ok).toBe(false);
    expect(parseDriverClockPostResponse({ ok: true, event: 'in' }).ok).toBe(
      false,
    );
  });
});
