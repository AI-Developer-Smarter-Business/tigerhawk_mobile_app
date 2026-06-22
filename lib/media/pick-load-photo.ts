import * as ImagePicker from 'expo-image-picker';

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
