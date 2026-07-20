import { createClientSignatureId } from '../create-client-signature-id';
import { parseLoadPodPreviewResponse } from '../pod-preview';

describe('createClientSignatureId', () => {
  it('returns a UUID-shaped string', () => {
    expect(createClientSignatureId()).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
  });
});

describe('parseLoadPodPreviewResponse', () => {
  it('parses camelCase TMS preview without inventing facts', () => {
    const result = parseLoadPodPreviewResponse({
      ok: true,
      state: 'unsigned',
      pod: {
        referenceNumber: 'THWK_1',
        customerName: 'Acme',
        containerNumber: null,
        sealNumber: null,
        chassisNumber: null,
        pickupLocation: 'Port',
        deliveryLocation: 'Yard',
        deliveryAddress: null,
        driverName: null,
        deliveredAt: null,
      },
      signature: null,
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.preview.state).toBe('unsigned');
    expect(result.preview.pod.referenceNumber).toBe('THWK_1');
    expect(result.preview.signature).toBeNull();
  });

  it('rejects incomplete bodies', () => {
    expect(parseLoadPodPreviewResponse({ ok: true }).ok).toBe(false);
  });
});
