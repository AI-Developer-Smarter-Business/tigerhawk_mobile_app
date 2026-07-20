import type { LoadDocument } from '@/types/load-document';

/** Newest matching document for a TMS `document_type` string. */
export function findLatestDocumentByType(
  documents: readonly LoadDocument[],
  documentType: string,
): LoadDocument | null {
  let latest: LoadDocument | null = null;
  let latestTs = Number.NEGATIVE_INFINITY;

  for (const doc of documents) {
    if (doc.document_type !== documentType) continue;
    const ts = doc.uploaded_at
      ? Date.parse(doc.uploaded_at)
      : Number.NEGATIVE_INFINITY;
    const score = Number.isFinite(ts) ? ts : Number.NEGATIVE_INFINITY;
    if (!latest || score >= latestTs) {
      latest = doc;
      latestTs = score;
    }
  }

  return latest;
}

export function hasDocumentType(
  documents: readonly LoadDocument[],
  documentType: string,
): boolean {
  return documents.some((doc) => doc.document_type === documentType);
}
