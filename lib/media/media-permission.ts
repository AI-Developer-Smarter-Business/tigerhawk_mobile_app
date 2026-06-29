import * as ImagePicker from 'expo-image-picker';
import { Linking } from 'react-native';

export type MediaPermissionSnapshot = {
  granted: boolean;
  canAskAgain: boolean;
};

export async function requestCameraPermission(): Promise<MediaPermissionSnapshot> {
  const result = await ImagePicker.requestCameraPermissionsAsync();
  return {
    granted: result.granted,
    canAskAgain: result.canAskAgain ?? true,
  };
}

export async function requestLibraryPermission(): Promise<MediaPermissionSnapshot> {
  const result = await ImagePicker.requestMediaLibraryPermissionsAsync();
  return {
    granted: result.granted,
    canAskAgain: result.canAskAgain ?? true,
  };
}

/** Opens the app settings screen (camera / photo library toggles). */
export function openAppSettings(): void {
  void Linking.openSettings();
}
