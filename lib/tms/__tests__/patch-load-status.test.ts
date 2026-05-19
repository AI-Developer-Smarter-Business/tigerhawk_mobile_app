import { patchLoadStatus } from '../patch-load-status';

jest.mock('@/lib/config/env', () => ({
  env: { tmsApiUrl: 'https://tms.example.com' },
}));

const originalFetch = global.fetch;

describe('patchLoadStatus', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('PATCHes status with bearer token', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      text: async () => '{}',
    });

    await patchLoadStatus({
      loadId: 'load-uuid',
      status: 'In Transit',
      accessToken: 'jwt-token',
    });

    expect(global.fetch).toHaveBeenCalledWith(
      'https://tms.example.com/api/dispatcher/loads/load-uuid/status',
      expect.objectContaining({
        method: 'PATCH',
        headers: expect.objectContaining({
          Authorization: 'Bearer jwt-token',
          'Content-Type': 'application/json',
        }),
        body: JSON.stringify({ status: 'In Transit' }),
      }),
    );
  });

  it('rejects non-driver status before fetch', async () => {
    await expect(
      patchLoadStatus({
        loadId: 'x',
        status: 'Completed',
        accessToken: 't',
      }),
    ).rejects.toMatchObject({ code: 'FORBIDDEN' });

    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('throws TmsStatusChangeError on ACTIVE_HOLDS', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 403,
      text: async () =>
        JSON.stringify({
          code: 'ACTIVE_HOLDS',
          error: 'Holds active',
          activeHolds: ['freight_hold'],
        }),
    });

    await expect(
      patchLoadStatus({
        loadId: 'x',
        status: 'In Transit',
        accessToken: 't',
      }),
    ).rejects.toMatchObject({ code: 'ACTIVE_HOLDS' });
  });
});
