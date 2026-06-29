import type { ImagePickerAsset } from 'expo-image-picker';
import * as ImagePicker from 'expo-image-picker';

import {
  requestCameraPermission,
  requestLibraryPermission,
} from '@/lib/media/media-permission';

const imagePickerOptions: ImagePicker.ImagePickerOptions = {
  mediaTypes: ['images'],
  allowsEditing: false,
  quality: 0.85,
};

export type PickLoadPhotoResult =
  | { ok: true; asset: ImagePickerAsset }
  | { ok: false; reason: 'cancelled' }
  | { ok: false; reason: 'permission_denied'; canAskAgain: boolean };

export async function pickLoadPhotoFromCamera(): Promise<PickLoadPhotoResult> {
  const permission = await requestCameraPermission();
  if (!permission.granted) {
    return { ok: false, reason: 'permission_denied', canAskAgain: permission.canAskAgain };
  }

  const result = await ImagePicker.launchCameraAsync(imagePickerOptions);
  if (result.canceled || !result.assets?.[0]) {
    return { ok: false, reason: 'cancelled' };
  }
  return { ok: true, asset: result.assets[0] };
}

export async function pickLoadPhotoFromLibrary(): Promise<PickLoadPhotoResult> {
  const permission = await requestLibraryPermission();
  if (!permission.granted) {
    return { ok: false, reason: 'permission_denied', canAskAgain: permission.canAskAgain };
  }

  const result = await ImagePicker.launchImageLibraryAsync(imagePickerOptions);
  if (result.canceled || !result.assets?.[0]) {
    return { ok: false, reason: 'cancelled' };
  }
  return { ok: true, asset: result.assets[0] };
}
