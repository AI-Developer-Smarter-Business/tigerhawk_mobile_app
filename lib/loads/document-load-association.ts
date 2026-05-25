import { safeLog } from '@/lib/logging/safe-log';

/** Minimal shape for association checks (Supabase row or TMS upload response). */
export type LoadDocumentAssociation = {
  id?: string;
  load_id: string;
  storage_path?: string | null;
};

export type DocumentAssociationFilterResult<T extends LoadDocumentAssociation> = {
  documents: T[];
  droppedCount: number;
};

/**
 * Normalizes route/query load id before hitting Supabase or TMS.
 * Returns null when the param is missing or blank (invalid deep link).
 */
export function normalizeLoadIdParam(loadId: string | undefined): string | null {
  const trimmed = loadId?.trim();
  return trimmed ? trimmed : null;
}

/** Row belongs to the load the driver opened in `/load/[id]`. */
export function documentBelongsToLoad(
  doc: LoadDocumentAssociation,
  expectedLoadId: string,
): boolean {
  return doc.load_id === expectedLoadId;
}

/**
 * TMS stores files under `{load_id}/…` in bucket `load-documents`.
 * When `storage_path` is present, it must match the expected load.
 */
export function storagePathMatchesLoad(
  storagePath: string | null | undefined,
  expectedLoadId: string,
): boolean {
  if (!storagePath?.trim()) return true;
  return storagePath.startsWith(`${expectedLoadId}/`);
}

function isDocumentAssociatedWithLoad<T extends LoadDocumentAssociation>(
  doc: T,
  expectedLoadId: string,
): boolean {
  return (
    documentBelongsToLoad(doc, expectedLoadId) &&
    storagePathMatchesLoad(doc.storage_path, expectedLoadId)
  );
}

/**
 * Defense in depth after `.eq('load_id', …)`: drops rows that do not match
 * the open load (data bug or stale cache). Logs in dev only; never shown to user.
 */
export function filterDocumentsForExpectedLoad<T extends LoadDocumentAssociation>(
  documents: T[],
  expectedLoadId: string,
): DocumentAssociationFilterResult<T> {
  const matched: T[] = [];
  const droppedIds: string[] = [];

  for (const doc of documents) {
    if (isDocumentAssociatedWithLoad(doc, expectedLoadId)) {
      matched.push(doc);
    } else if (doc.id) {
      droppedIds.push(doc.id);
    }
  }

  const droppedCount = documents.length - matched.length;
  if (droppedCount > 0) {
    safeLog.event('load_documents', 'association_mismatch', {
      expectedLoadId,
      droppedCount,
      documentIds: droppedIds,
    });
  }

  return { documents: matched, droppedCount };
}

/** Ensures TMS upload response is tied to the load the driver uploaded from. */
export function assertUploadResponseMatchesLoad(
  record: { load_id?: string | null },
  expectedLoadId: string,
): void {
  if (!record.load_id || record.load_id !== expectedLoadId) {
    throw new Error(
      'Document upload response does not match the current load. Try again or contact dispatch.',
    );
  }
}
