import { uploadDriverLoadDocumentViaSupabase } from '@/lib/supabase/upload-driver-load-document';
import type { DriverUploadDocumentType } from '@/lib/tms/assert-driver-document-type';
import { TmsDocumentUploadError } from '@/lib/tms/document-errors';
import type { TmsUploadFileDescriptor } from '@/lib/tms/document-upload-request';
import { getTmsApiUrl, resolveSupabaseAccessToken, uploadLoadDocument } from '@/lib/tms';
import type { LoadDocumentRecord } from '@/lib/tms/upload-load-document';
import type { LoadDocument } from '@/types/load-document';

export type UploadDriverLoadDocumentParams = {
  loadId: string;
  file: TmsUploadFileDescriptor;
  userId: string;
  documentType: DriverUploadDocumentType;
};

function mapTmsRecord(record: LoadDocumentRecord): LoadDocument {
  return {
    id: record.id,
    load_id: record.load_id,
    filename: record.filename,
    url: record.url,
    document_type: record.document_type,
    file_size: record.file_size ?? null,
    uploaded_at: record.uploaded_at ?? null,
  };
}

/** WT.28 — POD must hit TMS so open delivery_wait auto-closes. */
export function shouldUploadDriverDocumentViaTms(
  documentType: DriverUploadDocumentType,
): boolean {
  return documentType === 'POD';
}

async function uploadDriverDocumentViaTms(
  params: UploadDriverLoadDocumentParams,
): Promise<LoadDocument> {
  if (getTmsApiUrl().length === 0) {
    throw new TmsDocumentUploadError(
      'POD upload requires TMS API (wait timer auto-stop). Set EXPO_PUBLIC_TMS_API_URL.',
      'UNKNOWN',
    );
  }

  const accessToken = await resolveSupabaseAccessToken();
  const record = await uploadLoadDocument({
    loadId: params.loadId,
    file: params.file,
    documentType: params.documentType,
    accessToken,
  });

  return mapTmsRecord(record);
}

async function uploadDriverDocumentViaSupabaseWithTmsFallback(
  params: UploadDriverLoadDocumentParams,
): Promise<LoadDocument> {
  try {
    return await uploadDriverLoadDocumentViaSupabase(params);
  } catch (supabaseErr) {
    const tryTms =
      getTmsApiUrl().length > 0 &&
      supabaseErr instanceof TmsDocumentUploadError &&
      (supabaseErr.code === 'FORBIDDEN' || supabaseErr.code === 'UNKNOWN');

    if (!tryTms) {
      throw supabaseErr;
    }

    const accessToken = await resolveSupabaseAccessToken();
    const record = await uploadLoadDocument({
      loadId: params.loadId,
      file: params.file,
      documentType: params.documentType,
      accessToken,
    });

    return mapTmsRecord(record);
  }
}

/**
 * Driver document upload — POD always via TMS (WT.28); Driver/Photo via Supabase with TMS fallback.
 */
export async function uploadDriverLoadDocument(
  params: UploadDriverLoadDocumentParams,
): Promise<LoadDocument> {
  if (shouldUploadDriverDocumentViaTms(params.documentType)) {
    return uploadDriverDocumentViaTms(params);
  }

  return uploadDriverDocumentViaSupabaseWithTmsFallback(params);
}
