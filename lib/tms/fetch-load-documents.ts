import { getTmsApiUrl, tmsDocumentApiPath } from './client';
import { buildDocumentUploadPath } from './document-upload-request';
import type { LoadDocumentRecord } from './upload-load-document';

export type FetchTmsLoadDocumentsResult = {
  ok: boolean;
  documents: LoadDocumentRecord[];
};

/**
 * GET `/api/dispatcher/loads/[id]/documents` — long-lived URLs from `storage_path`, same as TMS web.
 * Requires Bearer patch on TMS; returns `ok: false` when TMS is unreachable or unauthorized.
 */
export async function fetchTmsLoadDocuments(
  loadId: string,
  accessToken: string,
): Promise<FetchTmsLoadDocumentsResult> {
  if (!getTmsApiUrl()) {
    return { ok: false, documents: [] };
  }

  const url = tmsDocumentApiPath(buildDocumentUploadPath(loadId));

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
      return { ok: false, documents: [] };
    }

    const body = (await response.json()) as { documents?: LoadDocumentRecord[] };
    const documents = Array.isArray(body.documents) ? body.documents : [];
    return { ok: true, documents };
  } catch {
    return { ok: false, documents: [] };
  }
}
