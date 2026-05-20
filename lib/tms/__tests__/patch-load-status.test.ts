import { patchLoadStatus } from '../patch-load-status';
import {
  buildStatusPatchBody,
  buildStatusPatchHeaders,
  buildStatusPatchPath,
} from '../status-patch-request';

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

  it('PATCHes status with bearer token and TMS payload contract', async () => {
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
      `https://tms.example.com${buildStatusPatchPath('load-uuid')}`,
      {
        method: 'PATCH',
        headers: buildStatusPatchHeaders('jwt-token'),
        body: buildStatusPatchBody('In Transit'),
      },
    );
  });

  it('encodes special characters in load id in the URL', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      text: async () => '',
    });

    await patchLoadStatus({
      loadId: 'id/with space',
      status: 'In Transit',
      accessToken: 't',
    });

    expect(global.fetch).toHaveBeenCalledWith(
      `https://tms.example.com${buildStatusPatchPath('id/with space')}`,
      expect.any(Object),
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

  it('allows non-field status when enforceDriverFieldOnly is false', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      text: async () => '{}',
    });

    await patchLoadStatus({
      loadId: 'x',
      status: 'Completed',
      accessToken: 't',
      enforceDriverFieldOnly: false,
    });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        body: buildStatusPatchBody('Completed'),
      }),
    );
  });

  it('throws NETWORK when fetch fails', async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new TypeError('Failed to fetch'));

    await expect(
      patchLoadStatus({
        loadId: 'x',
        status: 'In Transit',
        accessToken: 't',
      }),
    ).rejects.toMatchObject({ code: 'NETWORK' });
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

  it('throws UNAUTHORIZED on 401', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 401,
      text: async () => JSON.stringify({ error: 'Unauthorized' }),
    });

    await expect(
      patchLoadStatus({
        loadId: 'x',
        status: 'In Transit',
        accessToken: 't',
      }),
    ).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
  });

  it('throws INVALID_TRANSITION on 400 with validNextStates', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 400,
      text: async () =>
        JSON.stringify({
          error: 'Invalid transition',
          validNextStates: ['In Transit', 'Cancelled'],
        }),
    });

    await expect(
      patchLoadStatus({
        loadId: 'x',
        status: 'Delivered',
        accessToken: 't',
        enforceDriverFieldOnly: false,
      }),
    ).rejects.toMatchObject({
      code: 'INVALID_TRANSITION',
      validNextStates: ['In Transit', 'Cancelled'],
    });
  });
});
