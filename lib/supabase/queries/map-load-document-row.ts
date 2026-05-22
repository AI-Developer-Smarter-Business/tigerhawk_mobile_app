import type { LoadDocument } from '@/types/load-document';

export type LoadDocumentRow = {
  id: string;
  load_id: string;
  filename: string | null;
  document_type: string | null;
  file_size: number | null;
  url: string | null;
  uploaded_at: string | null;
};

export function mapLoadDocumentRow(row: LoadDocumentRow): LoadDocument {
  return {
    id: row.id,
    load_id: row.load_id,
    filename: row.filename?.trim() || 'Document',
    document_type: row.document_type?.trim() || 'Other',
    file_size: row.file_size,
    url: row.url,
    uploaded_at: row.uploaded_at,
  };
}
