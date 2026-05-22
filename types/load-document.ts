/** Row from `load_documents` shown on load detail (driver read-only). */
export type LoadDocument = {
  id: string;
  load_id: string;
  filename: string;
  document_type: string;
  file_size: number | null;
  url: string | null;
  uploaded_at: string | null;
};
