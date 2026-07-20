/**
 * TMS legal POD preview (GET …/pod) — TASKS G.1.
 * Facts come only from the server; the phone never invents a PDF.
 */

export type PodPreviewState = 'unsigned' | 'pending' | 'signed';

export type PodPreviewFacts = {
  referenceNumber: string;
  customerName: string | null;
  containerNumber: string | null;
  sealNumber: string | null;
  chassisNumber: string | null;
  pickupLocation: string | null;
  deliveryLocation: string | null;
  deliveryAddress: string | null;
  driverName: string | null;
  deliveredAt: string | null;
};

export type PodPreviewDocument = {
  id: string;
  filename: string;
  url: string | null;
  uploadedAt: string | null;
};

export type PodPreviewSignature = {
  id: string;
  clientSignatureId: string | null;
  signerName: string | null;
  signedAt: string | null;
  status: string | null;
  stampedAt: string | null;
  document: PodPreviewDocument | null;
};

export type LoadPodPreview = {
  pod: PodPreviewFacts;
  state: PodPreviewState;
  signature: PodPreviewSignature | null;
};

function asTrimmedString(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function asNullableString(value: unknown): string | null {
  if (value == null) return null;
  return asTrimmedString(value);
}

function parseDocument(raw: unknown): PodPreviewDocument | null {
  if (!raw || typeof raw !== 'object') return null;
  const row = raw as Record<string, unknown>;
  const id = asTrimmedString(row.id);
  const filename = asTrimmedString(row.filename);
  if (!id || !filename) return null;
  return {
    id,
    filename,
    url: asNullableString(row.url),
    uploadedAt: asNullableString(row.uploaded_at ?? row.uploadedAt),
  };
}

function parseSignature(raw: unknown): PodPreviewSignature | null {
  if (!raw || typeof raw !== 'object') return null;
  const row = raw as Record<string, unknown>;
  const id = asTrimmedString(row.id);
  if (!id) return null;

  const embed = row.load_documents;
  const document =
    parseDocument(embed) ??
    parseDocument(
      Array.isArray(embed) && embed.length > 0 ? embed[0] : null,
    );

  return {
    id,
    clientSignatureId: asNullableString(
      row.client_signature_id ?? row.clientSignatureId,
    ),
    signerName: asNullableString(row.signer_name ?? row.signerName),
    signedAt: asNullableString(row.signed_at ?? row.signedAt),
    status: asNullableString(row.status),
    stampedAt: asNullableString(row.stamped_at ?? row.stampedAt),
    document,
  };
}

function parseFacts(raw: unknown): PodPreviewFacts | null {
  if (!raw || typeof raw !== 'object') return null;
  const row = raw as Record<string, unknown>;
  const referenceNumber = asTrimmedString(
    row.referenceNumber ?? row.reference_number,
  );
  if (!referenceNumber) return null;

  return {
    referenceNumber,
    customerName: asNullableString(row.customerName ?? row.customer_name ?? row.customer),
    containerNumber: asNullableString(
      row.containerNumber ?? row.container_number,
    ),
    sealNumber: asNullableString(row.sealNumber ?? row.seal_number),
    chassisNumber: asNullableString(row.chassisNumber ?? row.chassis_number),
    pickupLocation: asNullableString(
      row.pickupLocation ?? row.pickup_location,
    ),
    deliveryLocation: asNullableString(
      row.deliveryLocation ?? row.delivery_location,
    ),
    deliveryAddress: asNullableString(
      row.deliveryAddress ?? row.delivery_address,
    ),
    driverName: asNullableString(row.driverName ?? row.driver_name),
    deliveredAt: asNullableString(row.deliveredAt ?? row.delivered_at),
  };
}

export function parseLoadPodPreviewResponse(
  body: unknown,
): { ok: true; preview: LoadPodPreview } | { ok: false; error: string } {
  if (!body || typeof body !== 'object') {
    return { ok: false, error: 'POD preview response was incomplete.' };
  }
  const row = body as Record<string, unknown>;
  if (row.ok !== true) {
    return { ok: false, error: 'POD preview response was incomplete.' };
  }

  const stateRaw = asTrimmedString(row.state);
  if (
    stateRaw !== 'unsigned' &&
    stateRaw !== 'pending' &&
    stateRaw !== 'signed'
  ) {
    return { ok: false, error: 'POD preview state was invalid.' };
  }

  const pod = parseFacts(row.pod);
  if (!pod) {
    return { ok: false, error: 'POD preview facts were incomplete.' };
  }

  return {
    ok: true,
    preview: {
      pod,
      state: stateRaw,
      signature: parseSignature(row.signature),
    },
  };
}
