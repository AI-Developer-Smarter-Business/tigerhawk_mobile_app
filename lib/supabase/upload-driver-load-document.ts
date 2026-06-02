import { getSupabase } from '@/lib/supabase/client';
import { filterDocumentsForExpectedLoad } from '@/lib/loads/document-load-association';
import { TmsDocumentUploadError } from '@/lib/tms/document-errors';
import type { TmsUploadFileDescriptor } from '@/lib/tms/document-upload-request';
import type { LoadDocument } from '@/types/load-document';

import { mapLoadDocumentRow, type LoadDocumentRow } from './queries/map-load-document-row';

const BUCKET = 'load-documents';
const DRIVER_DOCUMENT_TYPE = 'Driver';
const MAX_BYTES = 52_428_800;

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_');
}

function mapStorageError(message: string): TmsDocumentUploadError {
  const lower = message.toLowerCase();
  if (lower.includes('row-level security') || lower.includes('policy')) {
    return new TmsDocumentUploadError(
      'Upload blocked by Supabase policy. Run sql-editor/20260601120000_pp2_driver_upload_load_documents.sql in the SQL Editor.',
      'FORBIDDEN',
    );
  }
  if (lower.includes('payload too large') || lower.includes('413')) {
    return new TmsDocumentUploadError('File exceeds 50MB limit.', 'FILE_TOO_LARGE');
  }
  return new TmsDocumentUploadError(message, 'UNKNOWN');
}

/**
 * Uploads a driver photo directly to Supabase (Storage + load_documents).
 * Same table/columns as TMS dispatcher upload; requires driver RLS policies.
 */
export async function uploadDriverLoadDocumentViaSupabase(params: {
  loadId: string;
  file: TmsUploadFileDescriptor;
  userId: string;
}): Promise<LoadDocument> {
  const { loadId, file, userId } = params;

  if (!file.name?.trim()) {
    throw new TmsDocumentUploadError('File name is required.', 'BAD_REQUEST');
  }
  if (file.size <= 0 || file.size > MAX_BYTES) {
    throw new TmsDocumentUploadError(
      file.size > MAX_BYTES ? 'File exceeds 50MB limit.' : 'File is empty.',
      file.size > MAX_BYTES ? 'FILE_TOO_LARGE' : 'BAD_REQUEST',
    );
  }

  const supabase = getSupabase();
  const storagePath = `${loadId}/${Date.now()}_${sanitizeFilename(file.name)}`;

  const fileResponse = await fetch(file.uri);
  if (!fileResponse.ok) {
    throw new TmsDocumentUploadError('Could not read the selected photo.', 'BAD_REQUEST');
  }
  const body = await fileResponse.arrayBuffer();

  const { error: storageError } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, body, {
      contentType: file.type || 'application/octet-stream',
      upsert: false,
    });

  if (storageError) {
    throw mapStorageError(storageError.message);
  }

  const { data: signedData, error: signError } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(storagePath, 3600);

  if (signError) {
    await supabase.storage.from(BUCKET).remove([storagePath]);
    throw mapStorageError(signError.message);
  }

  const url = signedData?.signedUrl ?? '';

  const { data: inserted, error: insertError } = await supabase
    .from('load_documents')
    .insert({
      load_id: loadId,
      filename: file.name,
      url,
      storage_path: storagePath,
      document_type: DRIVER_DOCUMENT_TYPE,
      file_size: file.size,
      uploaded_by: userId,
      uploaded_at: new Date().toISOString(),
    })
    .select('id, load_id, filename, document_type, file_size, url, storage_path, uploaded_at')
    .single();

  if (insertError || !inserted) {
    await supabase.storage.from(BUCKET).remove([storagePath]);
    throw mapStorageError(insertError?.message ?? 'Failed to save document record');
  }

  const row = mapLoadDocumentRow(inserted as LoadDocumentRow);
  const { documents } = filterDocumentsForExpectedLoad([row], loadId);
  if (documents.length === 0) {
    throw new TmsDocumentUploadError('Document saved with wrong load association.', 'UNKNOWN');
  }

  return documents[0];
}
