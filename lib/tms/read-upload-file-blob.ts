import { Platform } from 'react-native';

import type { TmsUploadFileDescriptor } from './document-upload-request';

export type UploadFormFilePart =
  | Blob
  | { uri: string; name: string; type: string };

/** Ensures React Native multipart can read the file from cache / picker paths. */
export function normalizeUploadFileUri(uri: string): string {
  const trimmed = uri.trim();
  if (!trimmed) return trimmed;
  if (trimmed.startsWith('file://')) return trimmed;
  if (trimmed.startsWith('content://')) return trimmed;
  return trimmed.startsWith('/') ? `file://${trimmed}` : `file:///${trimmed}`;
}

function buildUriFilePart(file: TmsUploadFileDescriptor): {
  uri: string;
  name: string;
  type: string;
} {
  return {
    uri: normalizeUploadFileUri(file.uri),
    name: file.name,
    type: file.type || 'application/octet-stream',
  };
}

async function readLocalFileBlob(uri: string): Promise<Blob> {
  const response = await fetch(uri);
  if (!response.ok) {
    throw new Error('read_failed');
  }
  const rawBlob = await response.blob();
  if (rawBlob.size <= 0) {
    throw new Error('empty_blob');
  }
  return rawBlob;
}

/**
 * Resolves the multipart `file` part for TMS upload.
 * React Native must use `{ uri, name, type }` — appending a Blob breaks `fetch()` on device.
 */
export async function resolveUploadFormFilePart(
  file: TmsUploadFileDescriptor,
): Promise<UploadFormFilePart> {
  const uriPart = buildUriFilePart(file);

  if (Platform.OS !== 'web') {
    try {
      await readLocalFileBlob(uriPart.uri);
    } catch {
      // Still return uri part — picker/cache URIs are the RN contract.
    }
    return uriPart;
  }

  try {
    const rawBlob = await readLocalFileBlob(uriPart.uri);
    const mimeType = file.type || rawBlob.type || 'application/octet-stream';
    if (rawBlob.type === mimeType) {
      return rawBlob;
    }
    const buffer = await rawBlob.arrayBuffer();
    return new Blob([buffer], { type: mimeType });
  } catch {
    return uriPart;
  }
}
