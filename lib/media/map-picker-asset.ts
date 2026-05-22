import type { ImagePickerAsset } from 'expo-image-picker';

import { TmsDocumentUploadError } from '@/lib/tms/document-errors';
import type { TmsUploadFileDescriptor } from '@/lib/tms/document-upload-request';

import { isAllowedPodImageMime } from './allowed-image-mime';

function defaultFileName(asset: ImagePickerAsset): string {
  if (asset.fileName?.trim()) return asset.fileName.trim();
  const ext = asset.mimeType?.includes('png') ? 'png' : 'jpg';
  return `pod_${Date.now()}.${ext}`;
}

/** Maps an `expo-image-picker` asset to the TMS upload descriptor (sync; size may be 0). */
export function mapPickerAssetToUploadFile(asset: ImagePickerAsset): TmsUploadFileDescriptor {
  const mimeType = asset.mimeType ?? 'image/jpeg';
  if (!isAllowedPodImageMime(mimeType)) {
    throw new TmsDocumentUploadError(
      'Only image files (JPEG, PNG, HEIC, WebP) can be uploaded as POD.',
      'BAD_REQUEST',
    );
  }

  return {
    uri: asset.uri,
    name: defaultFileName(asset),
    type: mimeType,
    size: asset.fileSize ?? 0,
  };
}
