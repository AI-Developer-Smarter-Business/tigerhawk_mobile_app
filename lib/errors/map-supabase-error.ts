import { strings } from '@/constants/strings';

import { errorStrings } from './strings';
import type { UserFacingError } from './types';

type SupabaseLikeError = {
  message?: string;
  code?: string;
  details?: string;
};

function extractMessage(error: unknown): { message: string; code: string } {
  if (typeof error === 'string') {
    return { message: error, code: '' };
  }
  if (error instanceof Error) {
    const withCode = error as Error & { code?: string };
    return { message: error.message, code: withCode.code ?? '' };
  }
  if (error && typeof error === 'object' && 'message' in error) {
    const row = error as SupabaseLikeError;
    return { message: row.message ?? '', code: row.code ?? '' };
  }
  return { message: '', code: '' };
}

/**
 * Maps Supabase PostgREST / Auth errors to driver-friendly copy.
 * @see https://postgrest.org/en/stable/references/errors.html
 */
export function mapSupabaseError(error: unknown): UserFacingError {
  const { message, code } = extractMessage(error);
  const lower = message.toLowerCase();

  if (
    code === 'PGRST301' ||
    lower.includes('jwt expired') ||
    lower.includes('invalid claim')
  ) {
    return {
      kind: 'auth',
      title: errorStrings.authTitle,
      message: errorStrings.postgrestJwt,
    };
  }

  if (
    code === '42501' ||
    lower.includes('permission denied') ||
    lower.includes('row-level security') ||
    lower.includes('violates row-level security')
  ) {
    if (lower.includes('live location columns')) {
      return {
        kind: 'permission',
        title: strings.location.liveTrackingSettingsTitle,
        message: strings.location.liveTrackingServerBlocked,
      };
    }
    return {
      kind: 'permission',
      title: errorStrings.permissionTitle,
      message: errorStrings.postgrestPermission,
    };
  }

  if (code === 'PGRST116' || lower.includes('0 rows')) {
    return {
      kind: 'not_found',
      title: errorStrings.notFoundTitle,
      message: errorStrings.notFoundMessage,
    };
  }

  if (
    lower.includes('fetch failed') ||
    lower.includes('network request failed') ||
    lower.includes('failed to fetch')
  ) {
    return {
      kind: 'network',
      title: errorStrings.networkTitle,
      message: errorStrings.networkMessage,
    };
  }

  return {
    kind: 'generic',
    title: errorStrings.genericTitle,
    message: message || errorStrings.genericMessage,
  };
}
