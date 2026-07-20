import { act } from '@testing-library/react-native';

jest.mock('@/hooks/useAuth', () => ({
  useAuth: jest.fn(),
}));
jest.mock('@/context/NetworkContext', () => ({
  useNetwork: jest.fn(),
}));
jest.mock('@/context/OfflineQueueContext', () => ({
  useOfflineQueue: jest.fn(),
}));
jest.mock('@/lib/media/validate-driver-upload-file');
jest.mock('@/lib/offline/enqueue', () => ({
  enqueueDocumentUpload: jest.fn(),
}));
jest.mock('@/lib/loads/upload-driver-load-document', () => ({
  uploadDriverLoadDocument: jest.fn(),
}));
jest.mock('@/lib/query/invalidate-loads');

import { useNetwork } from '@/context/NetworkContext';
import { useOfflineQueue } from '@/context/OfflineQueueContext';
import { useLoadDocumentUpload } from '@/hooks/useLoadDocumentUpload';
import { createMockLoadDetail } from '@/hooks/testing/fixtures/mock-load-detail';
import {
  DRIVER_USER_ID,
  driverAuthState,
  renderDriverHook,
} from '@/hooks/testing/hooks-test-utils';
import { validateDriverUploadFile } from '@/lib/media/validate-driver-upload-file';
import { enqueueDocumentUpload } from '@/lib/offline/enqueue';
import { OfflineQueuedError } from '@/lib/offline/offline-queued-error';
import { uploadDriverLoadDocument } from '@/lib/loads/upload-driver-load-document';
import { invalidateLoadDocuments } from '@/lib/query/invalidate-loads';
import { TmsDocumentUploadError } from '@/lib/tms/document-errors';

const mockUpload = uploadDriverLoadDocument as jest.MockedFunction<
  typeof uploadDriverLoadDocument
>;
const mockUseAuth = jest.requireMock('@/hooks/useAuth').useAuth as jest.Mock;
const mockUseNetwork = useNetwork as jest.MockedFunction<typeof useNetwork>;
const mockUseOfflineQueue = useOfflineQueue as jest.MockedFunction<typeof useOfflineQueue>;
const mockEnqueue = enqueueDocumentUpload as jest.MockedFunction<typeof enqueueDocumentUpload>;
const mockValidate = validateDriverUploadFile as jest.MockedFunction<
  typeof validateDriverUploadFile
>;
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
    mockUseNetwork.mockReturnValue({ isOffline: false, isReady: true });
    mockUseOfflineQueue.mockReturnValue({
      pendingCount: 0,
      refreshPendingCount: jest.fn(async () => undefined),
    });
    mockValidate.mockImplementation(() => undefined);
    mockUpload.mockResolvedValue({
      id: 'doc-1',
      load_id: load.id,
      filename: 'photo.jpg',
      url: 'https://signed.example/photo.jpg',
      document_type: 'Driver',
      file_size: 1024,
      uploaded_at: '2026-06-02T12:00:00.000Z',
    });
    mockInvalidate.mockResolvedValue(undefined);
    mockEnqueue.mockResolvedValue({
      id: 'queued-1',
      type: 'document_upload',
      loadId: load.id,
      userId: DRIVER_USER_ID,
      documentType: 'Driver',
      file: sampleFile,
      createdAt: '2026-06-26T12:00:00.000Z',
      attempts: 0,
    });
  });

  it('normalizes POD photo label to Driver before upload (F.5)', async () => {
    const { result } = renderDriverHook(() => useLoadDocumentUpload(load));

    await act(async () => {
      await result.current(sampleFile, 'POD');
    });

    expect(mockValidate).toHaveBeenCalledWith(sampleFile);
    expect(mockUpload).toHaveBeenCalledWith({
      loadId: load.id,
      file: sampleFile,
      userId: DRIVER_USER_ID,
      documentType: 'Driver',
    });
    expect(mockInvalidate).toHaveBeenCalled();
  });

  it('keeps TIR Out type for Complete requirements (F.2)', async () => {
    const { result } = renderDriverHook(() => useLoadDocumentUpload(load));

    await act(async () => {
      await result.current(sampleFile, 'TIR Out');
    });

    expect(mockUpload).toHaveBeenCalledWith({
      loadId: load.id,
      file: sampleFile,
      userId: DRIVER_USER_ID,
      documentType: 'TIR Out',
    });
  });

  it('queues upload when offline (normalized type)', async () => {
    mockUseNetwork.mockReturnValue({ isOffline: true, isReady: true });
    const refreshPendingCount = jest.fn(async () => undefined);
    mockUseOfflineQueue.mockReturnValue({ pendingCount: 0, refreshPendingCount });

    const { result } = renderDriverHook(() => useLoadDocumentUpload(load));

    await expect(
      act(async () => {
        await result.current(sampleFile, 'POD');
      }),
    ).rejects.toBeInstanceOf(OfflineQueuedError);

    expect(mockEnqueue).toHaveBeenCalledWith({
      loadId: load.id,
      userId: DRIVER_USER_ID,
      documentType: 'Driver',
      file: sampleFile,
    });
    expect(refreshPendingCount).toHaveBeenCalled();
    expect(mockUpload).not.toHaveBeenCalled();
  });

  it('throws when session has no user id', async () => {
    mockUseAuth.mockReturnValue({ ...driverAuthState, user: null });

    const { result } = renderDriverHook(() => useLoadDocumentUpload(load));

    await expect(
      act(async () => {
        await result.current(sampleFile);
      }),
    ).rejects.toMatchObject({ code: 'UNAUTHORIZED' });

    expect(mockUpload).not.toHaveBeenCalled();
  });

  it('no-ops when load is null', async () => {
    const { result } = renderDriverHook(() => useLoadDocumentUpload(null));

    await act(async () => {
      await result.current(sampleFile);
    });

    expect(mockUpload).not.toHaveBeenCalled();
    expect(mockInvalidate).not.toHaveBeenCalled();
  });

  it('wraps unknown errors as TmsDocumentUploadError', async () => {
    mockUpload.mockRejectedValue(new Error('boom'));

    const { result } = renderDriverHook(() => useLoadDocumentUpload(load));

    await expect(
      act(async () => {
        await result.current(sampleFile, 'Driver');
      }),
    ).rejects.toBeInstanceOf(TmsDocumentUploadError);
  });
});
