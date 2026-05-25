import type { LoadDocumentRecord } from '@/lib/tms/upload-load-document';
import type { LoadDocument } from '@/types/load-document';

/** Maps TMS GET rows to the mobile list shape. */
export function mapTmsRecordToLoadDocument(record: LoadDocumentRecord): LoadDocument {
  return {
    id: record.id,
    load_id: record.load_id,
    filename: record.filename?.trim() || 'Document',
    document_type: record.document_type?.trim() || 'Other',
    file_size: record.file_size ?? null,
    url: record.url ?? null,
    uploaded_at: record.uploaded_at ?? null,
  };
}

/**
 * When TMS GET succeeds, its list is authoritative (handles deletes + fresh URLs).
 * When TMS fails, keep Supabase rows unchanged.
 */
export function reconcileLoadDocumentsWithTms(
  supabaseDocuments: LoadDocument[],
  tmsResult: { ok: boolean; documents: LoadDocumentRecord[] },
  expectedLoadId: string,
): LoadDocument[] {
  if (!tmsResult.ok) {
    return supabaseDocuments;
  }

  if (tmsResult.documents.length === 0) {
    return [];
  }

  return tmsResult.documents
    .filter((row) => row.load_id === expectedLoadId)
    .map(mapTmsRecordToLoadDocument);
}

/** Merges fresh `url` from TMS onto Supabase metadata when TMS returns partial data. */
export function mergeFreshUrlsFromTms(
  documents: LoadDocument[],
  tmsRecords: LoadDocumentRecord[],
): LoadDocument[] {
  if (tmsRecords.length === 0) {
    return documents;
  }
  const urlById = new Map(
    tmsRecords.filter((r) => r.url?.trim()).map((r) => [r.id, r.url!]),
  );
  return documents.map((doc) => {
    const freshUrl = urlById.get(doc.id);
    return freshUrl ? { ...doc, url: freshUrl } : doc;
  });
}
