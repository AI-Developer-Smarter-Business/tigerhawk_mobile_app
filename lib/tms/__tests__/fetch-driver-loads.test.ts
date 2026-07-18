import { fetchMobileDriverLoads } from '@/lib/tms/fetch-driver-loads';
import { MOBILE_DRIVER_LOADS_PATH } from '@/lib/tms/mobile-api-routes';

jest.mock('@/lib/tms/client', () => ({
  tmsApiPath: (path: string) => `https://tms.test${path}`,
}));

jest.mock('@/lib/tms/resolve-access-token', () => ({
  resolveSupabaseAccessToken: jest.fn(async () => 'token-abc'),
}));

describe('fetchMobileDriverLoads (B.3)', () => {
  it('GETs driver loads with Bearer token', async () => {
    const fetchImpl = jest.fn(async () => ({
      ok: true,
      status: 200,
      headers: { get: () => 'application/json' },
      json: async () => ({
        ok: true,
        active: [],
        upcoming: [
          {
            move_id: 'm1',
            load_id: 'l1',
            reference_number: 'THWK_1',
            status: 'Dispatched',
            started_at: null,
            accepted_at: null,
            stops: [],
            progress: { label: 'Start Move', phase: 'not_started', active_move_id: null },
            is_hazmat: false,
            is_hot: false,
          },
        ],
      }),
    })) as unknown as typeof fetch;

    const result = await fetchMobileDriverLoads({
      accessToken: 'token-abc',
      fetchImpl,
    });

    expect(fetchImpl).toHaveBeenCalledWith(
      `https://tms.test${MOBILE_DRIVER_LOADS_PATH}`,
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          Authorization: 'Bearer token-abc',
        }),
      }),
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.buckets.upcoming).toHaveLength(1);
    expect(result.buckets.upcoming[0]?.move_id).toBe('m1');
  });

  it('maps 401 to mobile error', async () => {
    const fetchImpl = jest.fn(async () => ({
      ok: false,
      status: 401,
      headers: { get: () => 'application/json' },
      json: async () => ({ error: 'Unauthorized', code: 'UNAUTHORIZED' }),
    })) as unknown as typeof fetch;

    const result = await fetchMobileDriverLoads({
      accessToken: 'bad',
      fetchImpl,
    });

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.mobileError?.code).toBe('UNAUTHORIZED');
  });
});
