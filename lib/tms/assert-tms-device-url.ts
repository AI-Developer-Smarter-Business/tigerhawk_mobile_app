import { Platform } from 'react-native';

import { getTmsApiUrl } from './client';
import { TmsDocumentUploadError } from './document-errors';

const LOCALHOST_PATTERN = /localhost|127\.0\.0\.1/i;

/**
 * On a physical device, `localhost` is the phone itself — TMS fetch will fail with "Network error".
 */
export function assertTmsUrlReachableFromDevice(): void {
  if (Platform.OS === 'web') return;

  const url = getTmsApiUrl();
  if (LOCALHOST_PATTERN.test(url)) {
    throw new TmsDocumentUploadError(
      'TMS API URL points to localhost. On a phone, set EXPO_PUBLIC_TMS_API_URL to your live TMS (e.g. https://tms.tigerhawklogistics.com).',
      'CONFIG',
    );
  }
}
