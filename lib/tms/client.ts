import { env } from '@/lib/config/env';

import { TmsStatusChangeError } from './errors';

/** TMS Next.js base URL (`EXPO_PUBLIC_TMS_API_URL` or `NEXT_PUBLIC_APP_URL`). */
export function getTmsApiUrl(): string {
  return env.tmsApiUrl;
}

/** Fails fast when the BFF base URL is missing (required for status PATCH). */
export function requireTmsApiUrl(): string {
  const url = getTmsApiUrl();
  if (!url) {
    throw new TmsStatusChangeError(
      'TMS API URL is not configured. Set EXPO_PUBLIC_TMS_API_URL in .env.local.',
      'CONFIG',
    );
  }
  return url;
}

/** Builds an absolute TMS API URL from a path such as `/api/dispatcher/loads/…/status`. */
export function tmsApiPath(path: string): string {
  const base = requireTmsApiUrl();
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${base}${normalized}`;
}
