import { act } from '@testing-library/react-native';

jest.mock('@/hooks/useAuth', () => ({
  useAuth: jest.fn(),
}));
jest.mock('@/lib/media/validate-driver-upload-file');
jest.mock('@/lib/network/assert-online');
jest.mock('@/lib/supabase/upload-driver-load-document', () => ({
  uploadDriverLoadDocumentViaSupabase: jest.fn(),
}));
jest.mock('@/lib/query/invalidate-loads');
jest.mock('@/lib/tms', () => ({
  getTmsApiUrl: jest.fn(() => 'https://tms.example.com'),
  resolveSupabaseAccessToken: jest.fn(async () => 'jwt-token'),
  uploadLoadDocument: jest.fn(),
}));

import { useLoadDocumentUpload } from '@/hooks/useLoadDocumentUpload';
import { createMockLoadDetail } from '@/hooks/testing/fixtures/mock-load-detail';
import {
  DRIVER_USER_ID,
  driverAuthState,
  renderDriverHook,
} from '@/hooks/testing/hooks-test-utils';
import { validateDriverUploadFile } from '@/lib/media/validate-driver-upload-file';
import { assertOnlineForDocumentUpload } from '@/lib/network/assert-online';
import { invalidateLoadDocuments } from '@/lib/query/invalidate-loads';
import { TmsDocumentUploadError } from '@/lib/tms/document-errors';
import { getTmsApiUrl, resolveSupabaseAccessToken, uploadLoadDocument } from '@/lib/tms';

const mockSupabaseUpload = jest.requireMock('@/lib/supabase/upload-driver-load-document')
  .uploadDriverLoadDocumentViaSupabase as jest.Mock;
const mockUseAuth = jest.requireMock('@/hooks/useAuth').useAuth as jest.Mock;
const mockValidate = validateDriverUploadFile as jest.MockedFunction<
  typeof validateDriverUploadFile
>;
const mockAssertOnline = assertOnlineForDocumentUpload as jest.MockedFunction<
  typeof assertOnlineForDocumentUpload
>;
const mockTmsUpload = uploadLoadDocument as jest.MockedFunction<typeof uploadLoadDocument>;
const mockInvalidate = invalidateLoadDocuments as jest.MockedFunction<
  typeof invalidateLoadDocuments
>;

const sampleFile = {
  uri: 'file:///photo.jpg',
  name: 'photo.jpg',
  type: 'image/jpeg',
  size: 1024,
};

describe('useLoadDocumentUpload', () => {
  const load = createMockLoadDetail({ id: 'load-upload-1' });

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue(driverAuthState);
    mockAssertOnline.mockResolvedValue(undefined);
    mockValidate.mockImplementation(() => undefined);
    mockSupabaseUpload.mockResolvedValue({
      id: 'doc-1',
      load_id: load.id,
      filename: 'photo.jpg',
      url: 'https://signed.example/photo.jpg',
      document_type: 'Driver',
      file_size: 1024,
      uploaded_at: '2026-06-02T12:00:00.000Z',
    });
    mockInvalidate.mockResolvedValue(undefined);
  });

  it('uploads via Supabase after online check and validation', async () => {
    const { result } = renderDriverHook(() => useLoadDocumentUpload(load));

    await act(async () => {
      await result.current(sampleFile);
    });

    expect(mockAssertOnline).toHaveBeenCalled();
    expect(mockValidate).toHaveBeenCalledWith(sampleFile);
    expect(mockSupabaseUpload).toHaveBeenCalledWith({
      loadId: load.id,
      file: sampleFile,
      userId: DRIVER_USER_ID,
    });
    expect(mockTmsUpload).not.toHaveBeenCalled();
    expect(mockInvalidate).toHaveBeenCalled();
  });

  it('falls back to TMS Driver upload when Supabase returns FORBIDDEN', async () => {
    mockSupabaseUpload.mockRejectedValue(
      new TmsDocumentUploadError('Forbidden', 'FORBIDDEN'),
    );
    mockTmsUpload.mockResolvedValue({
      id: 'doc-tms',
      load_id: load.id,
      filename: 'photo.jpg',
      url: 'https://signed.example/photo.jpg',
      document_type: 'Driver',
      file_size: 1024,
      uploaded_at: '2026-06-02T12:00:00.000Z',
    });

    const { result } = renderDriverHook(() => useLoadDocumentUpload(load));

    await act(async () => {
      await result.current(sampleFile);
    });

    expect(mockTmsUpload).toHaveBeenCalledWith({
      loadId: load.id,
      file: sampleFile,
      documentType: 'Driver',
      accessToken: 'jwt-token',
    });
    expect(resolveSupabaseAccessToken).toHaveBeenCalled();
    expect(getTmsApiUrl).toHaveBeenCalled();
  });

  it('throws when session has no user id', async () => {
    mockUseAuth.mockReturnValue({ ...driverAuthState, user: null });

    const { result } = renderDriverHook(() => useLoadDocumentUpload(load));

    await expect(
      act(async () => {
        await result.current(sampleFile);
      }),
    ).rejects.toMatchObject({ code: 'UNAUTHORIZED' });

    expect(mockSupabaseUpload).not.toHaveBeenCalled();
  });

  it('no-ops when load is null', async () => {
    const { result } = renderDriverHook(() => useLoadDocumentUpload(null));

    await act(async () => {
      await result.current(sampleFile);
    });

    expect(mockSupabaseUpload).not.toHaveBeenCalled();
    expect(mockInvalidate).not.toHaveBeenCalled();
  });
});
