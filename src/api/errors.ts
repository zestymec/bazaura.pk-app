export type ApiErrorKind = 'network' | 'timeout' | 'unauthorized' | 'validation' | 'not_found' | 'server' | 'unknown';

/** Every failure from the API layer is normalised into this shape. */
export class ApiError extends Error {
  kind: ApiErrorKind;
  status?: number;
  /** Field-level validation errors from FastAPI / DRF, keyed by field name. */
  fieldErrors?: Record<string, string>;

  constructor(kind: ApiErrorKind, message: string, status?: number, fieldErrors?: Record<string, string>) {
    super(message);
    this.name = 'ApiError';
    this.kind = kind;
    this.status = status;
    this.fieldErrors = fieldErrors;
  }

  static fromStatus(status: number, message?: string, fieldErrors?: Record<string, string>): ApiError {
    if (status === 401 || status === 403) return new ApiError('unauthorized', message || 'Please log in again.', status);
    if (status === 404) return new ApiError('not_found', message || 'Not found.', status);
    if (status === 400 || status === 422) {
      return new ApiError('validation', message || 'Please check the details and try again.', status, fieldErrors);
    }
    if (status >= 500) return new ApiError('server', message || 'Our servers are busy. Please try again shortly.', status);
    return new ApiError('unknown', message || 'Something went wrong.', status);
  }
}

/** User-facing message for any thrown value. */
export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return 'Something went wrong. Please try again.';
}
