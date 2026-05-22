import { File } from 'expo-file-system';

import type { TmsUploadFileDescriptor } from '@/lib/tms/document-upload-request';

/** Fills `size` when the picker omits `fileSize` (common on some Android builds). */
export async function resolveUploadFileSize(
  file: TmsUploadFileDescriptor,
): Promise<TmsUploadFileDescriptor> {
  if (file.size > 0) return file;

  try {
    const expoFile = new File(file.uri);
    if (expoFile.exists && expoFile.size > 0) {
      return { ...file, size: expoFile.size };
    }
  } catch {
    // Fall through — validateDocumentUploadFile will reject size 0.
  }

  return file;
}
