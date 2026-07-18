import {
  getMobileApiCodeContract,
  isMobileApiErrorCode,
  type MobileApiAppAction,
  type MobileApiErrorCode,
} from './mobile-api-error-codes';

export type MobileApiErrorBody = {
  code?: unknown;
  error?: unknown;
  message?: unknown;
  missing?: unknown;
};

/**
 * Thrown (or returned) for TMS `/api/mobile/*` JSON failures / special outcomes.
 * UI and auth gates switch on `appAction` (RESPUESTAS) rather than raw strings.
 */
export class TmsMobileApiError extends Error {
  readonly name = 'TmsMobileApiError';
  readonly code: MobileApiErrorCode | 'UNKNOWN';
  readonly httpStatus: number;
  readonly appAction: MobileApiAppAction | 'generic';
  /** Present when `code === 'REQUIREMENTS_NOT_MET'`. */
  readonly missing: string[];
  readonly rawBody: unknown;

  constructor(
    message: string,
    options: {
      code: MobileApiErrorCode | 'UNKNOWN';
      httpStatus: number;
      appAction: MobileApiAppAction | 'generic';
      missing?: string[];
      rawBody?: unknown;
    },
  ) {
    super(message);
    this.code = options.code;
    this.httpStatus = options.httpStatus;
    this.appAction = options.appAction;
    this.missing = options.missing ?? [];
    this.rawBody = options.rawBody;
  }

  get shouldDropSession(): boolean {
    return (
      this.appAction === 'drop_session_login' ||
      this.appAction === 'drop_session_contact_dispatch'
    );
  }

  get isDriverSuccess(): boolean {
    return this.appAction === 'treat_as_success_retry_silent';
  }
}

function asTrimmedString(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function asStringList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => (typeof item === 'string' ? item.trim() : ''))
    .filter(Boolean);
}

export function parseMobileApiErrorBody(
  body: unknown,
  httpStatus: number,
): TmsMobileApiError | null {
  if (body == null || typeof body !== 'object') {
    return null;
  }

  const record = body as MobileApiErrorBody;
  const codeRaw = asTrimmedString(record.code);
  const message =
    asTrimmedString(record.error) ??
    asTrimmedString(record.message) ??
    'TMS mobile API request failed.';

  if (codeRaw && isMobileApiErrorCode(codeRaw)) {
    const contract = getMobileApiCodeContract(codeRaw);
    return new TmsMobileApiError(message, {
      code: codeRaw,
      httpStatus,
      appAction: contract.appAction,
      missing: asStringList(record.missing),
      rawBody: body,
    });
  }

  // Auth login often returns `{ error: "Incorrect username or password." }` without `code`.
  if (httpStatus === 401 || httpStatus === 403) {
    const inferred: MobileApiErrorCode =
      httpStatus === 401 ? 'UNAUTHORIZED' : 'NOT_AUTHORIZED';
    const contract = getMobileApiCodeContract(inferred);
    return new TmsMobileApiError(message, {
      code: codeRaw && isMobileApiErrorCode(codeRaw) ? codeRaw : inferred,
      httpStatus,
      appAction: contract.appAction,
      missing: asStringList(record.missing),
      rawBody: body,
    });
  }

  if (codeRaw || asTrimmedString(record.error) || asTrimmedString(record.message)) {
    return new TmsMobileApiError(message, {
      code: 'UNKNOWN',
      httpStatus,
      appAction: 'generic',
      missing: asStringList(record.missing),
      rawBody: body,
    });
  }

  return null;
}

/**
 * Parse a `fetch` Response: reads JSON when possible; never throws on bad JSON.
 * Returns `null` on 2xx unless body carries `STAMP_PENDING` / `code` success variants.
 */
export async function parseMobileApiResponse(
  response: Response,
): Promise<TmsMobileApiError | null> {
  const status = response.status;
  let body: unknown = null;
  const contentType = response.headers.get('content-type') ?? '';
  if (contentType.includes('application/json')) {
    try {
      body = await response.json();
    } catch {
      body = null;
    }
  }

  if (status >= 200 && status < 300) {
    if (body && typeof body === 'object') {
      const code = asTrimmedString((body as MobileApiErrorBody).code);
      if (code === 'STAMP_PENDING' || status === 202) {
        const contract = getMobileApiCodeContract('STAMP_PENDING');
        return new TmsMobileApiError(
          asTrimmedString((body as MobileApiErrorBody).error) ??
            'Signature accepted; POD stamp pending.',
          {
            code: 'STAMP_PENDING',
            httpStatus: status,
            appAction: contract.appAction,
            rawBody: body,
          },
        );
      }
    }
    return null;
  }

  return (
    parseMobileApiErrorBody(body, status) ??
    new TmsMobileApiError(`TMS mobile API HTTP ${status}`, {
      code: status === 401 ? 'UNAUTHORIZED' : status === 403 ? 'NOT_AUTHORIZED' : 'UNKNOWN',
      httpStatus: status,
      appAction:
        status === 401
          ? 'drop_session_login'
          : status === 403
            ? 'drop_session_contact_dispatch'
            : 'generic',
      rawBody: body,
    })
  );
}
