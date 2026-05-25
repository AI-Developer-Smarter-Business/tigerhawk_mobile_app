import { uploadLoadDocument } from '../upload-load-document';
import {
  getCapturedDocumentType,
  getCapturedFilePart,
} from '../testing/form-data-test-utils';

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

  it('POSTs multipart FormData with file uri and document_type metadata', async () => {
    const appendEntries: Array<{ name: string; value: unknown }> = [];
    const originalAppend = FormData.prototype.append;
    jest
      .spyOn(FormData.prototype, 'append')
      .mockImplementation(function (this: FormData, name: string, value: unknown) {
        appendEntries.push({ name, value });
        return originalAppend.call(this, name, value as never);
      });

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

    await uploadLoadDocument({
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

    expect(getCapturedFilePart(appendEntries)).toEqual({
      uri: 'file:///pod.jpg',
      name: 'pod.jpg',
      type: 'image/jpeg',
    });
    expect(getCapturedDocumentType(appendEntries)).toBe('POD');

    jest.restoreAllMocks();
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

  it('rejects upload response when load_id does not match request', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 201,
      text: async () =>
        JSON.stringify({
          id: 'doc-1',
          load_id: 'other-load',
          filename: 'pod.jpg',
          url: 'https://signed.example/pod.jpg',
          document_type: 'POD',
        }),
    });

    await expect(
      uploadLoadDocument({
        loadId: 'load-1',
        accessToken: 'jwt',
        documentType: 'POD',
        file: {
          uri: 'file:///pod.jpg',
          name: 'pod.jpg',
          type: 'image/jpeg',
          size: 100,
        },
      }),
    ).rejects.toThrow(/does not match/);
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
