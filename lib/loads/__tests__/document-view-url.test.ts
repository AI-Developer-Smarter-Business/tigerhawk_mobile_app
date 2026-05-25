import {
  isSignedStorageUrlFailure,
  probeDocumentUrl,
} from '../document-view-url';

describe('isSignedStorageUrlFailure', () => {
  it('detects Supabase InvalidJWT / exp errors', () => {
    const body =
      '{"statusCode":"400","error":"InvalidJWT","message":"\\"exp\\" claim timestamp check failed"}';
    expect(isSignedStorageUrlFailure(400, body)).toBe(true);
  });

  it('ignores unrelated 400 bodies', () => {
    expect(isSignedStorageUrlFailure(400, '{"error":"bad request"}')).toBe(false);
  });
});

describe('probeDocumentUrl', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('returns ok when range request succeeds', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: true, status: 206 });
    await expect(probeDocumentUrl('https://example.com/file')).resolves.toBe('ok');
  });

  it('returns expired for InvalidJWT payload', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 400,
      text: async () =>
        '{"statusCode":"400","error":"InvalidJWT","message":"exp claim"}',
    });
    await expect(probeDocumentUrl('https://example.com/file')).resolves.toBe(
      'expired',
    );
  });
});
