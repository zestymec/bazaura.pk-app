import { Platform } from 'react-native';
import { env } from '../config/env';
import type { ApiErrorBody } from './types';
import { clearTokens, getAccessToken, getRefreshToken, saveTokens } from './tokens';

export { saveTokens, clearTokens, hasSession } from './tokens';

/** Every failure is an ApiError. Branch on `code`, never on `message` (FRONTEND.md §0.6). */
export class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public status: number,
    public details?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/** Human-readable message for anything thrown. Server messages are safe to display. */
export function errorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  return 'Something went wrong. Please try again.';
}

/** `VALIDATION_ERROR` details → `{ fieldName: message }` for inline form errors. */
export function fieldErrors(error: unknown): Record<string, string> {
  if (!(error instanceof ApiError) || error.code !== 'VALIDATION_ERROR' || !Array.isArray(error.details)) return {};
  const out: Record<string, string> = {};
  for (const d of error.details as { field?: string; message?: string }[]) {
    if (d?.field && d.message) out[d.field] = d.message;
  }
  return out;
}

/** Called when the session can't be recovered; the session module logs out and shows Login. */
let onSessionExpired: () => void = () => {};
export function setSessionExpiredHandler(fn: () => void) {
  onSessionExpired = fn;
}

let refreshing: Promise<boolean> | null = null;

async function refreshTokens(): Promise<boolean> {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) return false;
  try {
    const res = await fetch(`${env.API_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) return false;
    const body = await res.json();
    await saveTokens(body.data.accessToken, body.data.refreshToken);
    return true;
  } catch {
    return false;
  }
}

const SESSION_DEAD = ['AUTH_REQUIRED', 'TOKEN_INVALID', 'ACCOUNT_NOT_FOUND', 'ACCOUNT_INACTIVE'];

async function request<T>(path: string, init: RequestInit = {}, retried = false): Promise<T> {
  const token = await getAccessToken();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), env.TIMEOUT_MS);

  let res: Response;
  try {
    res = await fetch(`${env.API_URL}${path}`, {
      ...init,
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        'X-Platform': Platform.OS,
        'X-App-Version': env.APP_VERSION,
        ...(init.body ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...init.headers,
      },
    });
  } catch {
    throw new ApiError('NETWORK_ERROR', "Can't reach Bazaura right now. Check your connection.", 0);
  } finally {
    clearTimeout(timer);
  }

  const body = await res.json().catch(() => null);

  if (res.status === 401 && body?.error?.code === 'TOKEN_EXPIRED' && !retried) {
    refreshing ??= refreshTokens().finally(() => (refreshing = null));
    if (await refreshing) return request<T>(path, init, true);
    await clearTokens();
    onSessionExpired();
  } else if (token && SESSION_DEAD.includes(body?.error?.code)) {
    await clearTokens();
    onSessionExpired();
  }

  if (!res.ok || !body || body.success === false) {
    const err = body as ApiErrorBody | null;
    throw new ApiError(
      err?.error?.code ?? 'UNKNOWN_ERROR',
      err?.message ?? 'Something went wrong. Please try again.',
      res.status,
      err?.error?.details,
    );
  }
  return body.data as T;
}

export const http = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, data?: unknown) =>
    request<T>(path, { method: 'POST', body: data === undefined ? undefined : JSON.stringify(data) }),
  patch: <T>(path: string, data: unknown) => request<T>(path, { method: 'PATCH', body: JSON.stringify(data) }),
  put: <T>(path: string) => request<T>(path, { method: 'PUT' }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};

type QueryValue = string | number | boolean | string[] | null | undefined;

/** Builds a query string, repeating array params (?size=M&size=L) and skipping empty values. */
export function qs(params: Record<string, QueryValue>) {
  const parts: string[] = [];
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '' || value === false) continue;
    const add = (v: string | number | boolean) => parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(v))}`);
    if (Array.isArray(value)) value.forEach(add);
    else add(value);
  }
  return parts.length ? `?${parts.join('&')}` : '';
}
