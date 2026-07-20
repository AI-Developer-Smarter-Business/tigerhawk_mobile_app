import { mutateMobilePodSignature } from '@/lib/tms/mutate-pod-signature';
import { mobileLoadPodSignaturePath } from '@/lib/tms/mobile-api-routes';

jest.mock('@/lib/tms/client', () => ({
  tmsApiPath: (path: string) => `https://tms.test${path}`,
}));

jest.mock('@/lib/tms/resolve-access-token', () => ({
  resolveSupabaseAccessToken: jest.fn(async () => 'token-abc'),
}));

function jsonResponse(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: { get: () => 'application/json' },
    json: async () => body,
  } as unknown as Response;
}

describe('mutateMobilePodSignature (G.2 / G.3)', () => {
  it('posts stamp fields with client_signature_id', async () => {
    const fetchImpl = jest.fn(async () =>
      jsonResponse(
        {
          ok: true,
          state: 'signed',
          signature_id: 'sig-1',
          document: { id: 'doc-1', filename: 'pod.pdf', url: null, document_type: 'POD', uploaded_at: '2026-07-20T12:00:00Z' },
        },
        201,
      ),
    ) as unknown as typeof fetch;

    const result = await mutateMobilePodSignature({
      loadId: 'load-1',
      clientSignatureId: '11111111-1111-4111-8111-111111111111',
      signerName: 'Jane Receiver',
      signedAt: '2026-07-20T12:00:00.000Z',
      signaturePng: 'data:image/png;base64,abc123',
      accessToken: 'token-abc',
      fetchImpl,
    });

    expect(fetchImpl).toHaveBeenCalledWith(
      `https://tms.test${mobileLoadPodSignaturePath('load-1')}`,
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          client_signature_id: '11111111-1111-4111-8111-111111111111',
          signer_name: 'Jane Receiver',
          signed_at: '2026-07-20T12:00:00.000Z',
          signature_png: 'abc123',
        }),
      }),
    );
    expect(result).toEqual({
      ok: true,
      state: 'signed',
      signatureId: 'sig-1',
      stampPending: false,
    });
  });

  it('treats 202 STAMP_PENDING as driver success', async () => {
    const fetchImpl = jest.fn(async () =>
      jsonResponse(
        {
          ok: true,
          state: 'pending',
          signature_id: 'sig-2',
          code: 'STAMP_PENDING',
        },
        202,
      ),
    ) as unknown as typeof fetch;

    const result = await mutateMobilePodSignature({
      loadId: 'load-1',
      clientSignatureId: '22222222-2222-4222-8222-222222222222',
      signerName: 'Jane',
      signedAt: '2026-07-20T12:00:00.000Z',
      signaturePng: 'abc',
      fetchImpl,
    });

    expect(result).toEqual({
      ok: true,
      state: 'pending',
      signatureId: 'sig-2',
      stampPending: true,
    });
  });
});
