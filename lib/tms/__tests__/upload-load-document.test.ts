import { uploadLoadDocument } from '../upload-load-document';

jest.mock('@/lib/config/env', () => ({
  env: { tmsApiUrl: 'https://tms.example.com' },
}));

const originalFetch = global.fetch;

describe('uploadLoadDocument', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('POSTs to documents route and returns parsed record on 201', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 201,
      text: async () =>
        JSON.stringify({
          id: 'doc-1',
          load_id: 'load-1',
          filename: 'pod.jpg',
          url: 'https://signed.example/pod.jpg',
          document_type: 'POD',
        }),
    });

    const result = await uploadLoadDocument({
      loadId: 'load-1',
      accessToken: 'jwt',
      documentType: 'POD',
      file: {
        uri: 'file:///pod.jpg',
        name: 'pod.jpg',
        type: 'image/jpeg',
        size: 5000,
      },
    });

    expect(result.id).toBe('doc-1');
    expect(global.fetch).toHaveBeenCalledWith(
      'https://tms.example.com/api/dispatcher/loads/load-1/documents',
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('maps 403 from TMS to FORBIDDEN', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 403,
      text: async () =>
        JSON.stringify({
          error: "You don't have permission to upload documents for this load",
        }),
    });

    await expect(
      uploadLoadDocument({
        loadId: 'other-load',
        accessToken: 'jwt',
        documentType: 'POD',
        file: {
          uri: 'file:///pod.jpg',
          name: 'pod.jpg',
          type: 'image/jpeg',
          size: 100,
        },
      }),
    ).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });
});
