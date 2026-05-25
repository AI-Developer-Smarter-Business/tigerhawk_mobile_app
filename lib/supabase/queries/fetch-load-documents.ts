import type { SupabaseClient } from '@supabase/supabase-js';

import { filterDocumentsForExpectedLoad } from '@/lib/loads/document-load-association';
import type { LoadDocument } from '@/types/load-document';

import {
    mapLoadDocumentRow,
    type LoadDocumentRow,
} from './map-load-document-row';

const LOAD_DOCUMENTS_SELECT =
  'id, load_id, filename, document_type, file_size, url, storage_path, uploaded_at';

export type LoadDocumentsQueryResult = {
  documents: LoadDocument[];
  errorMessage: string | null;
};

/**
 * Lists documents for a load visible to the signed-in driver (RLS: assigned load only).
 * Same data TMS shows under Documents tab; no TMS HTTP required for the list.
 */
export async function fetchLoadDocumentsForDriver(
  supabase: SupabaseClient,
  loadId: string,
): Promise<LoadDocumentsQueryResult> {
  const { data, error } = await supabase
    .from('load_documents')
    .select(LOAD_DOCUMENTS_SELECT)
    .eq('load_id', loadId)
    .order('uploaded_at', { ascending: false });

  if (error) {
    return { documents: [], errorMessage: error.message };
  }

  const rows =
    (data as LoadDocumentRow[] | null)?.map(mapLoadDocumentRow) ?? [];
  const { documents } = filterDocumentsForExpectedLoad(rows, loadId);
  return { documents, errorMessage: null };
}
