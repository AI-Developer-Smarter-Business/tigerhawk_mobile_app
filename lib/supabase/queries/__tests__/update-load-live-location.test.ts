const mockFrom = jest.fn();

jest.mock('@/lib/supabase/client', () => ({
  getSupabase: () => ({ from: mockFrom }),
}));

import {
  LoadLiveLocationUpdateError,
  updateLoadLiveLocation,
} from '../update-load-live-location';

describe('updateLoadLiveLocation', () => {
  beforeEach(() => {
    mockFrom.mockReset();
  });

  function mockUpdateChain(result: { data: unknown; error: { message: string } | null }) {
    const maybeSingle = jest.fn(async () => result);
    const select = jest.fn(() => ({ maybeSingle }));
    const eq = jest.fn(() => ({ select }));
    const update = jest.fn(() => ({ eq }));
    mockFrom.mockReturnValue({ update });
    return { update, eq };
  }

  it('updates live location columns on assigned load', async () => {
    const { update } = mockUpdateChain({ data: { id: 'load-1' }, error: null });

    await updateLoadLiveLocation({
      loadId: 'load-1',
      update: {
        current_latitude: 29.76,
        current_longitude: -95.37,
        last_seen_at: '2026-06-22T12:00:00.000Z',
        location_accuracy_m: 10,
      },
    });

    expect(mockFrom).toHaveBeenCalledWith('loads');
    expect(update).toHaveBeenCalledWith({
      current_latitude: 29.76,
      current_longitude: -95.37,
      last_seen_at: '2026-06-22T12:00:00.000Z',
      location_accuracy_m: 10,
    });
  });

  it('throws when RLS blocks update or load is missing', async () => {
    mockUpdateChain({ data: null, error: null });

    await expect(
      updateLoadLiveLocation({
        loadId: 'missing',
        update: {
          current_latitude: 29.76,
          current_longitude: -95.37,
          last_seen_at: '2026-06-22T12:00:00.000Z',
          location_accuracy_m: null,
        },
      }),
    ).rejects.toMatchObject({
      name: 'LoadLiveLocationUpdateError',
      code: 'not_found',
    });
  });

  it('throws on Supabase error', async () => {
    mockUpdateChain({ data: null, error: { message: 'permission denied' } });

    await expect(
      updateLoadLiveLocation({
        loadId: 'load-1',
        update: {
          current_latitude: 29.76,
          current_longitude: -95.37,
          last_seen_at: '2026-06-22T12:00:00.000Z',
          location_accuracy_m: null,
        },
      }),
    ).rejects.toBeInstanceOf(LoadLiveLocationUpdateError);
  });
});
