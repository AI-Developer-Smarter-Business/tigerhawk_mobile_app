import { waitFor } from '@testing-library/react-native';

import { strings } from '@/constants/strings';
import { useAssignedLoadsQuery } from '@/hooks/useAssignedLoadsQuery';
import { fetchDriverLoadsPage } from '@/lib/supabase/queries';

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
const mockFetchDriverLoadsPage = fetchDriverLoadsPage as jest.MockedFunction<
  typeof fetchDriverLoadsPage
>;

describe('useAssignedLoadsQuery', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue(driverAuthState);
    mockUseProfile.mockReturnValue(driverProfileState);
  });

  it('loads assigned pages for an authenticated driver', async () => {
    const load = createMockLoadDetail({ reference_number: 'THWK_LIST' });
    mockFetchDriverLoadsPage.mockResolvedValue({
      loads: [load],
      errorMessage: null,
      hasMore: false,
      totalCount: 1,
      page: 0,
      pageSize: 20,
    });

    const { result } = renderDriverHook(() => useAssignedLoadsQuery());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.loads).toHaveLength(1);
    expect(result.current.loads[0].reference_number).toBe('THWK_LIST');
    expect(result.current.error).toBeNull();
    expect(mockFetchDriverLoadsPage).toHaveBeenCalledWith(
      expect.anything(),
      DRIVER_USER_ID,
      expect.objectContaining({ page: 0 }),
    );
  });

  it('maps Supabase errors to driver-friendly messages', async () => {
    mockFetchDriverLoadsPage.mockResolvedValue({
      loads: [],
      errorMessage: 'permission denied',
      hasMore: false,
      totalCount: null,
      page: 0,
      pageSize: 20,
    });

    const { result } = renderDriverHook(() => useAssignedLoadsQuery());

    await waitFor(() =>
      expect(result.current.error).toMatch(/do not have access/i),
    );

    expect(result.current.loads).toEqual([]);
  });

  it('does not fetch when the user is not a driver', async () => {
    mockUseProfile.mockReturnValue({
      profile: { role: 'dispatcher' },
      isDriver: false,
      loading: false,
      error: null,
      refetch: async () => {},
    });

    const { result } = renderDriverHook(() => useAssignedLoadsQuery());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe(strings.auth.notDriverRole);
    expect(mockFetchDriverLoadsPage).not.toHaveBeenCalled();
  });

  it('fetches the next page when loadMore is called', async () => {
    const page0Load = createMockLoadDetail({ id: 'load-a', reference_number: 'A' });
    const page1Load = createMockLoadDetail({ id: 'load-b', reference_number: 'B' });

    mockFetchDriverLoadsPage
      .mockResolvedValueOnce({
        loads: [page0Load],
        errorMessage: null,
        hasMore: true,
        totalCount: 2,
        page: 0,
        pageSize: 20,
      })
      .mockResolvedValueOnce({
        loads: [page1Load],
        errorMessage: null,
        hasMore: false,
        totalCount: 2,
        page: 1,
        pageSize: 20,
      });

    const { result } = renderDriverHook(() => useAssignedLoadsQuery());

    await waitFor(() => expect(result.current.loads).toHaveLength(1));
    expect(result.current.hasMore).toBe(true);

    await result.current.loadMore();

    await waitFor(() => expect(result.current.loads).toHaveLength(2));

    expect(result.current.loads.map((l) => l.reference_number)).toEqual(['A', 'B']);
    expect(mockFetchDriverLoadsPage).toHaveBeenCalledTimes(2);
  });
});
