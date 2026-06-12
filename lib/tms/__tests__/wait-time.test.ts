import {
  buildWaitTimePath,
  fetchWaitTimeEvents,
  startDeliveryWaitEvent,
  endOpenDeliveryWaitEvent,
  stopDeliveryWaitEvent,
  findOpenDeliveryWaitEvent,
} from '../wait-time';

jest.mock('@/lib/config/env', () => ({
  env: { tmsApiUrl: 'https://tms.example.com' },
}));

const originalFetch = global.fetch;

describe('wait-time TMS client', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('buildWaitTimePath encodes load id', () => {
    expect(buildWaitTimePath('abc/def')).toBe('/api/dispatcher/loads/abc%2Fdef/wait-time');
  });

  it('GET fetchWaitTimeEvents sends bearer token', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ events: [], summary: {} }),
    });

    await fetchWaitTimeEvents('load-1', 'token-abc');

    expect(global.fetch).toHaveBeenCalledWith(
      'https://tms.example.com/api/dispatcher/loads/load-1/wait-time',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer token-abc',
        }),
      }),
    );
  });

  it('POST startDeliveryWaitEvent sends delivery_wait payload', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ id: 'evt-1', start_time: '2026-06-10T12:00:00Z' }),
    });

    await startDeliveryWaitEvent({
      loadId: 'load-1',
      accessToken: 'jwt',
      location: 'Port Houston',
    });

    const [, init] = (global.fetch as jest.Mock).mock.calls[0] as [string, RequestInit];
    expect(init.method).toBe('POST');
    const body = JSON.parse(init.body as string);
    expect(body.event_name).toBe('delivery_wait');
    expect(body.logged_by).toBe('driver');
    expect(body.free_time_minutes).toBe(60);
  });

  it('PATCH stopDeliveryWaitEvent closes event', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ id: 'evt-1', end_time: '2026-06-10T13:00:00Z' }),
    });

    await stopDeliveryWaitEvent({
      loadId: 'load-1',
      eventId: 'evt-1',
      accessToken: 'jwt',
    });

    const [, init] = (global.fetch as jest.Mock).mock.calls[0] as [string, RequestInit];
    expect(init.method).toBe('PATCH');
    const body = JSON.parse(init.body as string);
    expect(body.event_id).toBe('evt-1');
    expect(body.end_time).toBeTruthy();
  });

  it('endOpenDeliveryWaitEvent PATCHes when open event exists', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          events: [
            {
              id: 'evt-open',
              event_name: 'delivery_wait',
              start_time: '2026-06-10T12:00:00Z',
              end_time: null,
            },
          ],
          summary: {},
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 'evt-open', end_time: '2026-06-10T13:00:00Z' }),
      });

    await endOpenDeliveryWaitEvent({
      loadId: 'load-1',
      accessToken: 'jwt',
    });

    expect(global.fetch).toHaveBeenCalledTimes(2);
    const [, patchInit] = (global.fetch as jest.Mock).mock.calls[1] as [string, RequestInit];
    expect(patchInit.method).toBe('PATCH');
  });

  it('endOpenDeliveryWaitEvent POSTs closed event when no open event', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ events: [], summary: {} }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 'evt-closed',
          start_time: '2026-06-10T12:00:00Z',
          end_time: '2026-06-10T13:00:00Z',
        }),
      });

    await endOpenDeliveryWaitEvent({
      loadId: 'load-1',
      accessToken: 'jwt',
      startTimeIso: '2026-06-10T12:00:00Z',
    });

    const [, postInit] = (global.fetch as jest.Mock).mock.calls[1] as [string, RequestInit];
    expect(postInit.method).toBe('POST');
    const body = JSON.parse(postInit.body as string);
    expect(body.start_time).toBe('2026-06-10T12:00:00Z');
    expect(body.end_time).toBeTruthy();
  });

  it('findOpenDeliveryWaitEvent returns open delivery_wait', () => {
    const open = findOpenDeliveryWaitEvent([
      { id: '1', event_name: 'pickup_wait', start_time: 'x', end_time: null } as never,
      { id: '2', event_name: 'delivery_wait', start_time: 'x', end_time: null } as never,
      { id: '3', event_name: 'delivery_wait', start_time: 'x', end_time: 'y' } as never,
    ]);
    expect(open?.id).toBe('2');
  });
});
