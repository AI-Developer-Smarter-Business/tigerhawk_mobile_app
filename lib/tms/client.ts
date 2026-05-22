import { env } from '@/lib/config/env';

import { TmsDocumentUploadError } from './document-errors';
import { TmsStatusChangeError } from './errors';

const TMS_CONFIG_MESSAGE =
  'TMS API URL is not configured. Set EXPO_PUBLIC_TMS_API_URL in .env.local.';

/** TMS Next.js base URL (`EXPO_PUBLIC_TMS_API_URL` or `NEXT_PUBLIC_APP_URL`). */
export function getTmsApiUrl(): string {
  return env.tmsApiUrl;
}

function buildAbsoluteTmsPath(path: string): string | null {
  const base = getTmsApiUrl();
  if (!base) return null;
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${base}${normalized}`;
}

/** Fails fast when the BFF base URL is missing (required for status PATCH). */
export function requireTmsApiUrl(): string {
  const url = getTmsApiUrl();
  if (!url) {
    throw new TmsStatusChangeError(TMS_CONFIG_MESSAGE, 'CONFIG');
  }
  return url;
}

/** Builds an absolute TMS API URL from a path such as `/api/dispatcher/loads/…/status`. */
export function tmsApiPath(path: string): string {
  const absolute = buildAbsoluteTmsPath(path);
  if (!absolute) {
    throw new TmsStatusChangeError(TMS_CONFIG_MESSAGE, 'CONFIG');
  }
  return absolute;
}

/** Same as `tmsApiPath` but throws `TmsDocumentUploadError` when the base URL is missing. */
export function tmsDocumentApiPath(path: string): string {
  const absolute = buildAbsoluteTmsPath(path);
  if (!absolute) {
    throw new TmsDocumentUploadError(TMS_CONFIG_MESSAGE, 'CONFIG');
  }
  return absolute;
}
