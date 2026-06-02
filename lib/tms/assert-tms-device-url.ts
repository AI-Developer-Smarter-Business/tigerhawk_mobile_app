import { Platform } from 'react-native';

import { getTmsApiUrl } from './client';
import { TmsDocumentUploadError } from './document-errors';
import { LOCALHOST_TMS_URL_PATTERN } from './resolve-tms-api-url';

/**
 * On a physical device, `localhost` is the phone itself — TMS fetch will fail with "Network error".
 * In dev, `getTmsApiUrl()` rewrites localhost to the Metro host IP when Expo provides it.
 */
export function assertTmsUrlReachableFromDevice(): void {
  if (Platform.OS === 'web') return;

  const url = getTmsApiUrl();
  if (LOCALHOST_TMS_URL_PATTERN.test(url)) {
    throw new TmsDocumentUploadError(
      'TMS API URL points to localhost. On a phone with local TMS: set EXPO_PUBLIC_TMS_API_URL to your PC LAN IP (e.g. http://192.168.1.10:3000), same Wi‑Fi, TMS running with npm run dev. Or use production TMS URL when deployed.',
      'CONFIG',
    );
  }
}
