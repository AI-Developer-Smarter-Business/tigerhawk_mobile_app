import { fetchMobileDriverProgress } from '@/lib/tms/fetch-driver-progress';
import { mobileLoadProgressPath } from '@/lib/tms/mobile-api-routes';

jest.mock('@/lib/tms/client', () => ({
  tmsApiPath: (path: string) => `https://tms.test${path}`,
}));

jest.mock('@/lib/tms/resolve-access-token', () => ({
  resolveSupabaseAccessToken: jest.fn(async () => 'token-abc'),
}));

const progress = {
  phase: 'arrived',
  label: 'Arrived At Deliver Load',
  activeMoveId: 'move-1',
  activeMoveIndex: 0,
  currentStop: {
    id: 'stop-1',
    event_type: 'deliver_container',
    sort_order: 0,
    started_at: '2026-07-16T10:00:00Z',
    arrived_at: '2026-07-16T11:00:00Z',
    departed_at: null,
    location: 'Customer',
  },
  nextStop: null,
  allMovesComplete: false,
  nextUnassignedMoveId: null,
  status: 'Arrived At Deliver Load',
  containerEmpty: true,
};

function jsonResponse(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: { get: () => 'application/json' },
    json: async () => body,
  } as unknown as Response;
}

describe('fetchMobileDriverProgress (D.3)', () => {
  it('GETs canonical progress with Bearer auth', async () => {
    const fetchImpl = jest.fn(async () =>
      jsonResponse({ ok: true, progress }),
    ) as unknown as typeof fetch;

    const result = await fetchMobileDriverProgress({
      loadId: 'load/1',
      accessToken: 'token-abc',
      fetchImpl,
    });

    expect(fetchImpl).toHaveBeenCalledWith(
      `https://tms.test${mobileLoadProgressPath('load/1')}`,
      {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          Authorization: 'Bearer token-abc',
        },
      },
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.progress).toEqual(progress);
  });

  it('maps NO_ROUTE to tell dispatch', async () => {
    const fetchImpl = jest.fn(async () =>
      jsonResponse(
        { error: 'This load has no route yet', code: 'NO_ROUTE' },
        409,
      ),
    ) as unknown as typeof fetch;

    const result = await fetchMobileDriverProgress({
      loadId: 'load-1',
      accessToken: 'token-abc',
      fetchImpl,
    });

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.mobileError?.code).toBe('NO_ROUTE');
    expect(result.mobileError?.appAction).toBe('tell_dispatch');
  });
});
