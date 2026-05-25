import * as Linking from 'expo-linking';

import { strings } from '@/constants/strings';
import { assertOnlineForDriverAction } from '@/lib/network/assert-online';

import { probeDocumentUrl } from './document-view-url';
import type { LoadDocument } from '@/types/load-document';

export type OpenLoadDocumentParams = {
  doc: LoadDocument;
  /** Refetch list (Supabase + TMS when available) and return latest rows. */
  refreshDocuments: () => Promise<LoadDocument[]>;
};

export type OpenLoadDocumentResult =
  | { opened: true }
  | { opened: false; reason: 'no_url' | 'expired' | 'missing' | 'unavailable' };

function findDocumentById(
  documents: LoadDocument[],
  documentId: string,
): LoadDocument | undefined {
  return documents.find((d) => d.id === documentId);
}

async function tryOpenUrl(url: string): Promise<boolean> {
  const probe = await probeDocumentUrl(url);
  if (probe !== 'ok') {
    return false;
  }
  const canOpen = await Linking.canOpenURL(url);
  if (!canOpen) {
    return false;
  }
  await Linking.openURL(url);
  return true;
}

/**
 * Opens a load document in the device browser/PDF viewer.
 * Refreshes the list once when the stored signed URL is expired or missing.
 */
export async function openLoadDocument(
  params: OpenLoadDocumentParams,
): Promise<OpenLoadDocumentResult> {
  const { doc, refreshDocuments } = params;

  await assertOnlineForDriverAction();

  let url = doc.url?.trim();

  if (!url) {
    const refreshed = await refreshDocuments();
    const latest = findDocumentById(refreshed, doc.id);
    url = latest?.url?.trim();
    if (!url) {
      if (!findDocumentById(refreshed, doc.id)) {
        return { opened: false, reason: 'missing' };
      }
      return { opened: false, reason: 'no_url' };
    }
  }

  if (await tryOpenUrl(url)) {
    return { opened: true };
  }

  const refreshed = await refreshDocuments();
  const latest = findDocumentById(refreshed, doc.id);
  if (!latest) {
    return { opened: false, reason: 'missing' };
  }

  const freshUrl = latest.url?.trim();
  if (!freshUrl) {
    return { opened: false, reason: 'no_url' };
  }

  if (await tryOpenUrl(freshUrl)) {
    return { opened: true };
  }

  const probe = await probeDocumentUrl(freshUrl);
  if (probe === 'expired') {
    return { opened: false, reason: 'expired' };
  }
  if (probe === 'missing') {
    return { opened: false, reason: 'missing' };
  }
  return { opened: false, reason: 'unavailable' };
}

export function documentOpenFailureMessage(
  reason: 'no_url' | 'expired' | 'missing' | 'unavailable',
): { title: string; message: string } {
  switch (reason) {
    case 'expired':
      return {
        title: strings.loadDetail.documentOpenFailed,
        message: strings.loadDetail.documentLinkExpired,
      };
    case 'missing':
      return {
        title: strings.loadDetail.documentOpenFailed,
        message: strings.loadDetail.documentRemoved,
      };
    case 'no_url':
      return {
        title: strings.loadDetail.documentOpenFailed,
        message: strings.loadDetail.documentNoUrl,
      };
    default:
      return {
        title: strings.loadDetail.documentOpenFailed,
        message: strings.loadDetail.documentUnavailable,
      };
  }
}
