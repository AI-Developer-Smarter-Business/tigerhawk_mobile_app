import type { SupabaseClient } from '@supabase/supabase-js';

const BUCKET = 'load-documents';

/** ~10 years — matches TMS `resolve-document-url.ts`; avoids 1h expiry in DB. */
export const LOAD_DOCUMENT_SIGNED_URL_TTL_SEC = 60 * 60 * 24 * 365 * 10;

export async function resolveLoadDocumentUrlForDriver(
  supabase: SupabaseClient,
  storagePath: string | null | undefined,
  fallbackUrl?: string | null,
): Promise<string | null> {
  const trimmedFallback = fallbackUrl?.trim() || null;

  if (!storagePath?.trim()) {
    return trimmedFallback;
  }

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(storagePath, LOAD_DOCUMENT_SIGNED_URL_TTL_SEC);

  if (error || !data?.signedUrl?.trim()) {
    return trimmedFallback;
  }

  return data.signedUrl.trim();
}
