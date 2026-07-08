import { Platform } from 'react-native';

import { resolveUploadFormFilePart, normalizeUploadFileUri } from '../read-upload-file-blob';

const sampleFile = {
  uri: 'file:///cache/pp2-signatures/signature_load_1.png',
  name: 'signature_load_1.png',
  type: 'image/png',
  size: 128,
};

describe('normalizeUploadFileUri', () => {
  it('adds file:// when missing', () => {
    expect(normalizeUploadFileUri('/cache/signature.png')).toBe('file:///cache/signature.png');
  });
});

describe('resolveUploadFormFilePart', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('returns uri part on React Native (Blob breaks FormData fetch)', async () => {
    Platform.OS = 'ios';
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      blob: async () => new Blob([new Uint8Array([1, 2, 3])], { type: 'image/png' }),
    });

    const part = await resolveUploadFormFilePart(sampleFile);
    expect(part).toEqual({
      uri: sampleFile.uri,
      name: sampleFile.name,
      type: 'image/png',
    });
  });

  it('returns a Blob on web when fetch can read the local file', async () => {
    Platform.OS = 'web';
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      blob: async () => new Blob([new Uint8Array([1, 2, 3])], { type: 'image/png' }),
    });

    const part = await resolveUploadFormFilePart(sampleFile);
    expect(part).toBeInstanceOf(Blob);
    expect((part as Blob).size).toBe(3);
  });

  it('falls back to uri part when fetch fails on native', async () => {
    Platform.OS = 'android';
    global.fetch = jest.fn().mockRejectedValue(new Error('read_failed'));

    const part = await resolveUploadFormFilePart(sampleFile);
    expect(part).toEqual({
      uri: sampleFile.uri,
      name: sampleFile.name,
      type: 'image/png',
    });
  });
});
