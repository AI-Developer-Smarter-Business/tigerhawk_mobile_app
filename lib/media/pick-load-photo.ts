import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';

import { strings } from '@/constants/strings';

const imagePickerOptions: ImagePicker.ImagePickerOptions = {
  mediaTypes: ['images'],
  allowsEditing: false,
  quality: 0.85,
};

export async function pickLoadPhotoFromCamera(): Promise<ImagePicker.ImagePickerAsset | null> {
  const permission = await ImagePicker.requestCameraPermissionsAsync();
  if (!permission.granted) {
    return null;
  }

  const result = await ImagePicker.launchCameraAsync(imagePickerOptions);
  if (result.canceled || !result.assets?.[0]) {
    return null;
  }
  return result.assets[0];
}

export async function pickLoadPhotoFromLibrary(): Promise<ImagePicker.ImagePickerAsset | null> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    return null;
  }

  const result = await ImagePicker.launchImageLibraryAsync(imagePickerOptions);
  if (result.canceled || !result.assets?.[0]) {
    return null;
  }
  return result.assets[0];
}

type PhotoSourceHandlers = {
  onCamera: () => void;
  onLibrary: () => void;
};

/** Native action sheet: camera, gallery, or cancel. */
export function showLoadPhotoSourcePicker(handlers: PhotoSourceHandlers): void {
  Alert.alert(
    strings.loadDetail.podPickTitle,
    strings.loadDetail.podPickMessage,
    [
      { text: strings.loadDetail.podPickCamera, onPress: handlers.onCamera },
      { text: strings.loadDetail.podPickGallery, onPress: handlers.onLibrary },
      { text: strings.loadDetail.podCancel, style: 'cancel' },
    ],
  );
}
