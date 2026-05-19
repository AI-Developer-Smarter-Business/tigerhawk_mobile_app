import { waitFor } from '@testing-library/react-native';

import { strings } from '@/constants/strings';
import { useLoadDetailQuery } from '@/hooks/useLoadDetailQuery';
import { fetchLoadDetailForDriver } from '@/lib/supabase/queries';

import {
  DRIVER_USER_ID,
  driverAuthState,
  driverProfileState,
  renderDriverHook,
} from '@/hooks/testing/hooks-test-utils';
import { createMockLoadDetail } from '@/hooks/testing/fixtures/mock-load-detail';

jest.mock('@/hooks/useAuth');
jest.mock('@/hooks/useProfile');
jest.mock('@/lib/supabase/queries', () => ({
  fetchDriverLoadsPage: jest.fn(),
  fetchLoadDetailForDriver: jest.fn(),
}));
jest.mock('@/lib/supabase/client', () => ({
  getSupabase: jest.fn(() => ({})),
}));

const mockUseAuth = jest.requireMock('@/hooks/useAuth').useAuth as jest.Mock;
const mockUseProfile = jest.requireMock('@/hooks/useProfile').useProfile as jest.Mock;
const mockFetchLoadDetailForDriver = fetchLoadDetailForDriver as jest.MockedFunction<
  typeof fetchLoadDetailForDriver
>;

describe('useLoadDetailQuery', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue(driverAuthState);
    mockUseProfile.mockReturnValue(driverProfileState);
  });

  it('returns load detail from Supabase', async () => {
    const load = createMockLoadDetail({
      id: 'load-detail-1',
      reference_number: 'THWK_DETAIL',
    });
    mockFetchLoadDetailForDriver.mockResolvedValue({
      load,
      errorMessage: null,
      notFound: false,
    });

    const { result } = renderDriverHook(() => useLoadDetailQuery('load-detail-1'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.load?.reference_number).toBe('THWK_DETAIL');
    expect(result.current.error).toBeNull();
    expect(result.current.notFound).toBe(false);
    expect(mockFetchLoadDetailForDriver).toHaveBeenCalledWith(
      expect.anything(),
      'load-detail-1',
      DRIVER_USER_ID,
    );
  });

  it('marks notFound when Supabase returns no row', async () => {
    mockFetchLoadDetailForDriver.mockResolvedValue({
      load: null,
      errorMessage: null,
      notFound: true,
    });

    const { result } = renderDriverHook(() => useLoadDetailQuery('missing-load'));

    await waitFor(() => expect(result.current.notFound).toBe(true));

    expect(result.current.load).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('shows cached list data while detail fetch is pending', async () => {
    const cached = createMockLoadDetail({
      id: 'load-cached',
      reference_number: 'THWK_CACHED',
    });

    let resolveFetch!: (value: Awaited<ReturnType<typeof fetchLoadDetailForDriver>>) => void;
    mockFetchLoadDetailForDriver.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveFetch = resolve;
        }),
    );

    const { result } = renderDriverHook(() => useLoadDetailQuery('load-cached'), {
      initialLoads: [cached],
    });

    expect(result.current.load?.reference_number).toBe('THWK_CACHED');

    resolveFetch({
      load: createMockLoadDetail({
        id: 'load-cached',
        reference_number: 'THWK_REFRESHED',
      }),
      errorMessage: null,
      notFound: false,
    });

    await waitFor(() =>
      expect(result.current.load?.reference_number).toBe('THWK_REFRESHED'),
    );
  });

  it('surfaces fetch errors and keeps cached load when available', async () => {
    const cached = createMockLoadDetail({ id: 'load-err', reference_number: 'THWK_ERR' });
    mockFetchLoadDetailForDriver.mockResolvedValue({
      load: null,
      errorMessage: 'timeout',
      notFound: false,
    });

    const { result } = renderDriverHook(() => useLoadDetailQuery('load-err'), {
      initialLoads: [cached],
    });

    await waitFor(() => expect(result.current.error).toBe('timeout'));

    expect(result.current.load?.reference_number).toBe('THWK_ERR');
    expect(result.current.notFound).toBe(false);
  });

  it('blocks fetch for non-driver accounts', async () => {
    mockUseProfile.mockReturnValue({
      profile: { role: 'staff' },
      isDriver: false,
      loading: false,
      error: null,
      refetch: async () => {},
    });

    const { result } = renderDriverHook(() => useLoadDetailQuery('load-1'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe(strings.auth.notDriverRole);
    expect(mockFetchLoadDetailForDriver).not.toHaveBeenCalled();
  });
});
