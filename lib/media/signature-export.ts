import { Directory, File, Paths } from 'expo-file-system';

import { normalizeUploadFileUri } from '@/lib/tms/read-upload-file-blob';
import type { TmsUploadFileDescriptor } from '@/lib/tms/document-upload-request';

import { resolveUploadFileSize } from './resolve-upload-file-size';

let signatureDir: Directory | null = null;

function getSignatureDir(): Directory {
  if (!signatureDir) {
    signatureDir = new Directory(Paths.cache, 'pp2-signatures');
  }
  return signatureDir;
}

function ensureSignatureDir(): void {
  const dir = getSignatureDir();
  if (!dir.exists) {
    dir.create({ intermediates: true, idempotent: true });
  }
}

/** Safe file name for a finger/stylus signature upload. */
export function buildSignatureFileName(loadRef?: string | null): string {
  const safeRef = (loadRef ?? 'load')
    .trim()
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .slice(0, 40);
  return `signature_${safeRef || 'load'}_${Date.now()}.png`;
}

/**
 * Strip `data:image/...;base64,` prefix from SignatureCanvas / WebView payloads.
 */
export function stripDataUrlBase64(payload: string): string {
  const trimmed = payload.trim();
  const marker = 'base64,';
  const index = trimmed.indexOf(marker);
  if (index >= 0) {
    return trimmed.slice(index + marker.length).replace(/\s/g, '');
  }
  return trimmed.replace(/\s/g, '');
}

export function base64ToUint8Array(base64: string): Uint8Array {
  const normalized = stripDataUrlBase64(base64);
  if (!normalized) {
    throw new Error('Empty signature image.');
  }

  if (typeof globalThis.atob === 'function') {
    const binary = globalThis.atob(normalized);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }

  // Jest / Node
  return Uint8Array.from(Buffer.from(normalized, 'base64'));
}

/**
 * Writes a signature PNG to the app cache and returns an upload descriptor.
 */
export async function writeSignatureUploadFile(params: {
  base64Payload: string;
  loadRef?: string | null;
}): Promise<TmsUploadFileDescriptor> {
  const name = buildSignatureFileName(params.loadRef);
  const bytes = base64ToUint8Array(params.base64Payload);
  if (bytes.byteLength === 0) {
    throw new Error('Empty signature image.');
  }

  ensureSignatureDir();
  const file = new File(getSignatureDir(), name);
  if (file.exists) {
    file.delete();
  }
  file.create({ overwrite: true, intermediates: true });
  file.write(bytes);

  const formUri = normalizeUploadFileUri(file.uri);

  return resolveUploadFileSize({
    uri: formUri,
    name,
    type: 'image/png',
    size: bytes.byteLength,
  });
}
