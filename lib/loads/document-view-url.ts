/** Result of probing a Supabase Storage signed URL before opening in the browser. */
export type DocumentUrlProbeResult = 'ok' | 'expired' | 'missing' | 'unavailable';

/**
 * Detects expired Supabase signed URLs (common when `url` in DB is older than ~1h).
 * Example body: `{"statusCode":"400","error":"InvalidJWT","message":"\"exp\" claim timestamp check failed"}`
 */
export function isSignedStorageUrlFailure(
  status: number,
  body: string,
): boolean {
  if (status !== 400 && status !== 401 && status !== 403) {
    return false;
  }
  const text = body.toLowerCase();
  return (
    text.includes('invalidjwt') ||
    text.includes('timestamp check failed') ||
    text.includes('"exp"') ||
    text.includes('expired')
  );
}

/** Lightweight check without opening the system browser. */
export async function probeDocumentUrl(
  url: string,
): Promise<DocumentUrlProbeResult> {
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: { Range: 'bytes=0-0' },
    });

    if (response.ok || response.status === 206) {
      return 'ok';
    }

    const body = await response.text().catch(() => '');
    if (response.status === 404) {
      return 'missing';
    }
    if (isSignedStorageUrlFailure(response.status, body)) {
      return 'expired';
    }
    return 'unavailable';
  } catch {
    return 'unavailable';
  }
}
