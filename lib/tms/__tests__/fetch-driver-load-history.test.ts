import { fetchMobileDriverLoadHistory } from '@/lib/tms/fetch-driver-load-history';
import { MOBILE_DRIVER_LOAD_HISTORY_PATH } from '@/lib/tms/mobile-api-routes';

jest.mock('@/lib/tms/client', () => ({
  tmsApiPath: (path: string) => `https://tms.test${path}`,
}));

jest.mock('@/lib/tms/resolve-access-token', () => ({
  resolveSupabaseAccessToken: jest.fn(async () => 'token-abc'),
}));

describe('fetchMobileDriverLoadHistory (B.4)', () => {
  it('GETs history with Bearer token and query params', async () => {
    const fetchImpl = jest.fn(async () => ({
      ok: true,
      status: 200,
      headers: { get: () => 'application/json' },
      json: async () => ({
        ok: true,
        history: [
          {
            move_id: 'm-done',
            load_id: 'l1',
            reference_number: 'THWK_9',
            status: 'Completed',
            started_at: '2026-07-10T10:00:00Z',
            accepted_at: '2026-07-10T09:00:00Z',
            stops: [],
            progress: { label: 'Completed', phase: 'done', active_move_id: null },
            is_hazmat: false,
            is_hot: false,
          },
        ],
      }),
    })) as unknown as typeof fetch;

    const result = await fetchMobileDriverLoadHistory({
      from: '2026-07-11',
      to: '2026-07-12',
      q: 'THWK',
      accessToken: 'token-abc',
      fetchImpl,
    });

    expect(fetchImpl).toHaveBeenCalledWith(
      `https://tms.test${MOBILE_DRIVER_LOAD_HISTORY_PATH}?from=2026-07-11&to=2026-07-12&q=THWK`,
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          Authorization: 'Bearer token-abc',
        }),
      }),
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.history).toHaveLength(1);
    expect(result.history[0]?.move_id).toBe('m-done');
  });

  it('maps 404 to not-available copy', async () => {
    const fetchImpl = jest.fn(async () => ({
      ok: false,
      status: 404,
      headers: { get: () => 'application/json' },
      json: async () => null,
    })) as unknown as typeof fetch;

    const result = await fetchMobileDriverLoadHistory({
      from: '2026-07-11',
      to: '2026-07-12',
      accessToken: 'token-abc',
      fetchImpl,
    });

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toContain('not available');
  });
});
