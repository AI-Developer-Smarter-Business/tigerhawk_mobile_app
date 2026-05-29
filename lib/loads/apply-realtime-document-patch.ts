import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

import type { LoadDocumentRecord } from '@/lib/tms/upload-load-document';
import { mapTmsRecordToLoadDocument } from '@/lib/loads/merge-tms-documents';
import type { LoadDocument } from '@/types/load-document';

type DocumentRow = {
  id?: string;
  load_id?: string;
  filename?: string | null;
  document_type?: string | null;
  file_size?: number | null;
  url?: string | null;
  uploaded_at?: string | null;
};

export function documentIdFromPayload(
  payload: RealtimePostgresChangesPayload<DocumentRow>,
): string | undefined {
  const next = payload.new as DocumentRow | null;
  const prev = payload.old as DocumentRow | null;
  return next?.id ?? prev?.id;
}

export function patchDocumentsFromRealtimePayload(
  documents: LoadDocument[] | undefined,
  payload: RealtimePostgresChangesPayload<DocumentRow>,
): LoadDocument[] | undefined {
  if (!documents) {
    return documents;
  }

  const docId = documentIdFromPayload(payload);
  if (!docId) {
    return documents;
  }

  if (payload.eventType === 'DELETE') {
    const next = documents.filter((doc) => doc.id !== docId);
    return next.length === documents.length ? documents : next;
  }

  if (payload.eventType === 'INSERT' && payload.new) {
    const row = payload.new as DocumentRow;
    if (!row.id || !row.load_id) {
      return documents;
    }
    if (documents.some((doc) => doc.id === row.id)) {
      return documents;
    }
    return [...documents, mapTmsRecordToLoadDocument(row as LoadDocumentRecord)];
  }

  if (payload.eventType === 'UPDATE' && payload.new) {
    const row = payload.new as DocumentRow;
    const mapped = mapTmsRecordToLoadDocument(row as LoadDocumentRecord);
    return documents.map((doc) => (doc.id === docId ? { ...doc, ...mapped } : doc));
  }

  return documents;
}
