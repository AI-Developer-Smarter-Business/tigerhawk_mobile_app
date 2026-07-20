import { mutateMobileDriverClock } from '@/lib/tms/mutate-driver-clock';
import { fetchMobileDriverClock } from '@/lib/tms/fetch-driver-clock';
import { MOBILE_DRIVER_CLOCK_PATH } from '@/lib/tms/mobile-api-routes';

jest.mock('@/lib/tms/client', () => ({
  tmsApiPath: (path: string) => `https://tms.test${path}`,
}));

jest.mock('@/lib/tms/resolve-access-token', () => ({
  resolveSupabaseAccessToken: jest.fn(async () => 'token-abc'),
}));

function jsonResponse(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: { get: () => 'application/json' },
    json: async () => body,
  } as unknown as Response;
}

describe('driver clock TMS clients (I.2)', () => {
  it('GETs /api/mobile/driver/clock', async () => {
    const fetchImpl = jest.fn(async () =>
      jsonResponse({
        ok: true,
        driver_id: 'drv-1',
        driver_name: 'Alex',
        is_clocked_in: false,
        status: 'Off Duty',
        last_clock_in_at: null,
        last_clock_out_at: '2026-07-20T12:00:00.000Z',
      }),
    ) as unknown as typeof fetch;

    const result = await fetchMobileDriverClock({
      accessToken: 'token-abc',
      fetchImpl,
    });

    expect(fetchImpl).toHaveBeenCalledWith(
      `https://tms.test${MOBILE_DRIVER_CLOCK_PATH}`,
      expect.objectContaining({ method: 'GET' }),
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.state.isClockedIn).toBe(false);
  });

  it('POSTs event in/out to the same path', async () => {
    const fetchImpl = jest.fn(async () =>
      jsonResponse({
        ok: true,
        driver_id: 'drv-1',
        driver_name: 'Alex',
        event: 'in',
        is_clocked_in: true,
        status: 'Available',
        previous_status: 'Off Duty',
        occurred_at: '2026-07-20T13:00:00.000Z',
      }),
    ) as unknown as typeof fetch;

    const result = await mutateMobileDriverClock({
      event: 'in',
      accessToken: 'token-abc',
      fetchImpl,
    });

    expect(fetchImpl).toHaveBeenCalledWith(
      `https://tms.test${MOBILE_DRIVER_CLOCK_PATH}`,
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ event: 'in' }),
      }),
    );
    expect(result.ok).toBe(true);
  });
});
