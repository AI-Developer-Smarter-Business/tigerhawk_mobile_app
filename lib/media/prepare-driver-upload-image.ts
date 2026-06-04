import type { ImagePickerAsset } from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { Platform } from 'react-native';

import type { TmsUploadFileDescriptor } from '@/lib/tms/document-upload-request';

import {
  DRIVER_UPLOAD_IMAGE_MAX_EDGE_PX,
  DRIVER_UPLOAD_JPEG_QUALITY,
  DRIVER_UPLOAD_SKIP_PREPARE_MAX_BYTES,
} from './driver-upload-image-policy';
import { mapPickerAssetToUploadFile } from './map-picker-asset';
import { resolveUploadFileSize } from './resolve-upload-file-size';

function isHeicLike(mimeType: string | undefined): boolean {
  const m = mimeType?.toLowerCase() ?? '';
  return m.includes('heic') || m.includes('heif');
}

function exceedsMaxEdge(width: number, height: number): boolean {
  return (
    width > DRIVER_UPLOAD_IMAGE_MAX_EDGE_PX || height > DRIVER_UPLOAD_IMAGE_MAX_EDGE_PX
  );
}

/** Whether to resize/compress before upload (skipped on web). */
export function shouldPrepareDriverUploadImage(
  asset: ImagePickerAsset,
  fileSizeBytes: number,
): boolean {
  if (Platform.OS === 'web') {
    return false;
  }
  if (isHeicLike(asset.mimeType)) {
    return true;
  }
  const width = asset.width ?? 0;
  const height = asset.height ?? 0;
  if (width > 0 && height > 0 && exceedsMaxEdge(width, height)) {
    return true;
  }
  return fileSizeBytes > DRIVER_UPLOAD_SKIP_PREPARE_MAX_BYTES;
}

function buildResizeActions(
  width: number,
  height: number,
): ImageManipulator.Action[] {
  if (width <= 0 || height <= 0 || !exceedsMaxEdge(width, height)) {
    return [];
  }
  if (width >= height) {
    return [{ resize: { width: DRIVER_UPLOAD_IMAGE_MAX_EDGE_PX } }];
  }
  return [{ resize: { height: DRIVER_UPLOAD_IMAGE_MAX_EDGE_PX } }];
}

function jpegFileName(originalName: string): string {
  const base = originalName.replace(/\.[^.]+$/i, '');
  return `${base || `pod_${Date.now()}`}.jpg`;
}

/**
 * Maps picker asset, optionally resizes/compresses for upload, and resolves file size.
 */
export async function prepareDriverUploadImage(
  asset: ImagePickerAsset,
): Promise<TmsUploadFileDescriptor> {
  const mapped = mapPickerAssetToUploadFile(asset);
  const withSize = await resolveUploadFileSize(mapped);

  if (!shouldPrepareDriverUploadImage(asset, withSize.size)) {
    return withSize;
  }

  const width = asset.width ?? 0;
  const height = asset.height ?? 0;
  const actions = buildResizeActions(width, height);

  const result = await ImageManipulator.manipulateAsync(withSize.uri, actions, {
    compress: DRIVER_UPLOAD_JPEG_QUALITY,
    format: ImageManipulator.SaveFormat.JPEG,
  });

  const prepared: TmsUploadFileDescriptor = {
    uri: result.uri,
    name: jpegFileName(withSize.name),
    type: 'image/jpeg',
    size: 0,
  };

  return resolveUploadFileSize(prepared);
}
