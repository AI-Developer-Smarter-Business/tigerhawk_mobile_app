/** Keys that must never appear in log payloads. */
const SENSITIVE_KEY =
  /password|passwd|token|secret|authorization|refresh_token|access_token|apikey|api_key|credential/i;

const SENSITIVE_VALUE =
  /^(Bearer\s+)?eyJ[a-zA-Z0-9_-]*\.[a-zA-Z0-9_-]*\.[a-zA-Z0-9_-]*$/;

function redactValue(key: string, value: unknown): unknown {
  if (SENSITIVE_KEY.test(key)) return '[REDACTED]';
  if (typeof value === 'string' && SENSITIVE_VALUE.test(value.trim())) {
    return '[REDACTED]';
  }
  return value;
}

function sanitizeMeta(meta?: Record<string, unknown>): Record<string, unknown> | undefined {
  if (!meta) return undefined;
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(meta)) {
    out[key] = redactValue(key, value);
  }
  return out;
}

import { isExpectedAuthError } from '@/lib/auth/expected-auth-errors';

/**
 * Dev-only logging. Never pass passwords, tokens, or full Supabase session objects.
 * In production builds, these calls are no-ops.
 *
 * Uses console.warn (not error) so React Native LogBox does not show a red screen
 * for routine auth failures.
 */
export const safeLog = {
  error(scope: string, message: string, meta?: Record<string, unknown>): void {
    if (!__DEV__) return;
    const safeMeta = sanitizeMeta(meta);
    if (safeMeta && Object.keys(safeMeta).length > 0) {
      console.warn(`[${scope}]`, message, safeMeta);
    } else {
      console.warn(`[${scope}]`, message);
    }
  },
  /** Wrong password / unknown user — expected; never opens LogBox. */
  authFailure(scope: string, message: string): void {
    if (!__DEV__ || isExpectedAuthError(message)) return;
    console.warn(`[${scope}]`, message);
  },
  warn(scope: string, message: string): void {
    if (!__DEV__) return;
    console.warn(`[${scope}]`, message);
  },
};
