import {
  shouldUploadDriverDocumentViaTms,
  uploadDriverLoadDocument,
} from '@/lib/loads/upload-driver-load-document';
import { TmsDocumentUploadError } from '@/lib/tms/document-errors';
import { getTmsApiUrl, resolveSupabaseAccessToken, uploadLoadDocument } from '@/lib/tms';

jest.mock('@/lib/supabase/upload-driver-load-document', () => ({
  uploadDriverLoadDocumentViaSupabase: jest.fn(),
}));
jest.mock('@/lib/tms', () => ({
  getTmsApiUrl: jest.fn(() => 'https://tms.example.com'),
  resolveSupabaseAccessToken: jest.fn(async () => 'jwt-token'),
  uploadLoadDocument: jest.fn(),
}));

const mockSupabaseUpload = jest.requireMock('@/lib/supabase/upload-driver-load-document')
  .uploadDriverLoadDocumentViaSupabase as jest.Mock;
const mockTmsUpload = uploadLoadDocument as jest.MockedFunction<typeof uploadLoadDocument>;
const mockGetTmsApiUrl = getTmsApiUrl as jest.MockedFunction<typeof getTmsApiUrl>;

const sampleFile = {
  uri: 'file:///photo.jpg',
  name: 'photo.jpg',
  type: 'image/jpeg',
  size: 1024,
};

const tmsRecord = {
  id: 'doc-tms',
  load_id: 'load-1',
  filename: 'photo.jpg',
  url: 'https://signed.example/photo.jpg',
  document_type: 'Driver',
  file_size: 1024,
  uploaded_at: '2026-06-27T12:00:00.000Z',
};

describe('shouldUploadDriverDocumentViaTms', () => {
  it('returns true for POD and TIR types required by TMS Complete', () => {
    expect(shouldUploadDriverDocumentViaTms('POD')).toBe(true);
    expect(shouldUploadDriverDocumentViaTms('TIR Out')).toBe(true);
    expect(shouldUploadDriverDocumentViaTms('TIR In')).toBe(true);
    expect(shouldUploadDriverDocumentViaTms('Driver')).toBe(false);
    expect(shouldUploadDriverDocumentViaTms('Photo')).toBe(false);
  });
});

describe('uploadDriverLoadDocument', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetTmsApiUrl.mockReturnValue('https://tms.example.com');
    mockTmsUpload.mockResolvedValue(tmsRecord);
    mockSupabaseUpload.mockResolvedValue({
      ...tmsRecord,
      id: 'doc-sb',
      document_type: 'Driver',
    });
  });

  it('routes TIR Out through TMS so Complete can clear tir_out_photo', async () => {
    await uploadDriverLoadDocument({
      loadId: 'load-1',
      file: sampleFile,
      userId: 'user-1',
      documentType: 'TIR Out',
    });

    expect(mockTmsUpload).toHaveBeenCalledWith({
      loadId: 'load-1',
      file: sampleFile,
      documentType: 'TIR Out',
      accessToken: 'jwt-token',
    });
    expect(mockSupabaseUpload).not.toHaveBeenCalled();
  });

  it('routes POD through TMS for WT.28 auto-stop', async () => {
    await uploadDriverLoadDocument({
      loadId: 'load-1',
      file: sampleFile,
      userId: 'user-1',
      documentType: 'POD',
    });

    expect(mockTmsUpload).toHaveBeenCalledWith({
      loadId: 'load-1',
      file: sampleFile,
      documentType: 'POD',
      accessToken: 'jwt-token',
    });
    expect(mockSupabaseUpload).not.toHaveBeenCalled();
  });

  it('uses Supabase for Driver uploads when available', async () => {
    await uploadDriverLoadDocument({
      loadId: 'load-1',
      file: sampleFile,
      userId: 'user-1',
      documentType: 'Driver',
    });

    expect(mockSupabaseUpload).toHaveBeenCalled();
    expect(mockTmsUpload).not.toHaveBeenCalled();
  });

  it('throws when POD upload requested without TMS URL', async () => {
    mockGetTmsApiUrl.mockReturnValue('');

    await expect(
      uploadDriverLoadDocument({
        loadId: 'load-1',
        file: sampleFile,
        userId: 'user-1',
        documentType: 'POD',
      }),
    ).rejects.toMatchObject({ code: 'UNKNOWN' });
  });

  it('falls back to TMS when Supabase returns FORBIDDEN for Driver', async () => {
    mockSupabaseUpload.mockRejectedValue(
      new TmsDocumentUploadError('Forbidden', 'FORBIDDEN'),
    );

    await uploadDriverLoadDocument({
      loadId: 'load-1',
      file: sampleFile,
      userId: 'user-1',
      documentType: 'Driver',
    });

    expect(mockTmsUpload).toHaveBeenCalledWith({
      loadId: 'load-1',
      file: sampleFile,
      documentType: 'Driver',
      accessToken: 'jwt-token',
    });
  });
});
