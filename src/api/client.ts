import { Platform } from 'react-native';
import { env } from '../config/env';
import { ApiError } from './errors';
import { tokenStorage } from './tokenStorage';
import { endpoints } from './endpoints';

type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
type Query = Record<string, string | number | boolean | null | undefined>;

export interface RequestOptions {
  query?: Query;
  body?: unknown;
  /** Attach the bearer token (default true; harmless on public endpoints). */
  auth?: boolean;
  signal?: AbortSignal;
  /** Override the default retry count (GET only). */
  retries?: number;
  headers?: Record<string, string>;
}

/** Called when the refresh token is rejected — the auth store logs the user out. */
let onSessionExpired: (() => void) | null = null;
export function setSessionExpiredHandler(handler: () => void) {
  onSessionExpired = handler;
}

function buildUrl(path: string, query?: Query): string {
  const base = `${env.API_BASE_URL}${env.API_PREFIX}${path}`;
  if (!query) return base;
  const qs = Object.entries(query)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join('&');
  return qs ? `${base}?${qs}` : base;
}

/** Pulls a human message out of FastAPI (`detail`) or our envelope (`message`). */
function extractError(body: any): { message?: string; fieldErrors?: Record<string, string> } {
  if (!body || typeof body !== 'object') return {};
  if (Array.isArray(body.detail)) {
    const fieldErrors: Record<string, string> = {};
    body.detail.forEach((d: any) => {
      const field = Array.isArray(d.loc) ? d.loc[d.loc.length - 1] : 'non_field';
      fieldErrors[String(field)] = d.msg;
    });
    return { message: body.detail[0]?.msg, fieldErrors };
  }
  return { message: body.message || body.detail || body.error, fieldErrors: body.errors };
}

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

async function rawFetch(method: Method, path: string, opts: RequestOptions, accessToken?: string) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), env.REQUEST_TIMEOUT_MS);
  opts.signal?.addEventListener('abort', () => controller.abort());

  const headers: Record<string, string> = {
    Accept: 'application/json',
    'X-App-Version': env.APP_VERSION,
    'X-Platform': Platform.OS,
    ...opts.headers,
  };
  if (opts.body !== undefined) headers['Content-Type'] = 'application/json';
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

  try {
    return await fetch(buildUrl(path, opts.query), {
      method,
      headers,
      body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
      signal: controller.signal,
    });
  } catch (e: any) {
    if (opts.signal?.aborted) throw e;
    if (e?.name === 'AbortError') throw new ApiError('timeout', 'The request timed out. Check your connection.');
    throw new ApiError('network', 'No internet connection. Please try again.');
  } finally {
    clearTimeout(timer);
  }
}

// Single-flight refresh: concurrent 401s share one refresh call.
let refreshing: Promise<boolean> | null = null;
async function refreshTokens(): Promise<boolean> {
  if (!refreshing) {
    refreshing = (async () => {
      const tokens = await tokenStorage.get();
      if (!tokens?.refreshToken) return false;
      try {
        const res = await rawFetch('POST', endpoints.auth.refresh, {
          body: { refresh_token: tokens.refreshToken },
        });
        if (!res.ok) return false;
        const json = await res.json();
        const data = json?.data ?? json;
        await tokenStorage.set({ accessToken: data.access_token, refreshToken: data.refresh_token });
        return true;
      } catch {
        return false;
      }
    })().finally(() => {
      setTimeout(() => (refreshing = null), 0);
    });
  }
  return refreshing;
}

async function request<T>(method: Method, path: string, opts: RequestOptions = {}): Promise<T> {
  const useAuth = opts.auth !== false;
  const maxRetries = method === 'GET' ? opts.retries ?? env.GET_RETRIES : 0;

  let attempt = 0;
  let didRefresh = false;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const token = useAuth ? (await tokenStorage.get())?.accessToken : undefined;
    let res: Response;
    try {
      res = await rawFetch(method, path, opts, token);
    } catch (e) {
      if (e instanceof ApiError && (e.kind === 'network' || e.kind === 'timeout') && attempt < maxRetries) {
        attempt += 1;
        await sleep(400 * 2 ** (attempt - 1));
        continue;
      }
      throw e;
    }

    if (res.status === 401 && useAuth && token && !didRefresh) {
      didRefresh = true;
      if (await refreshTokens()) continue;
      await tokenStorage.clear();
      onSessionExpired?.();
    }

    if (res.status === 204) return undefined as T;

    let body: any = null;
    const text = await res.text();
    if (text) {
      try {
        body = JSON.parse(text);
      } catch {
        body = null;
      }
    }

    if (!res.ok || body?.success === false) {
      if (res.status >= 500 && attempt < maxRetries) {
        attempt += 1;
        await sleep(400 * 2 ** (attempt - 1));
        continue;
      }
      const { message, fieldErrors } = extractError(body);
      throw ApiError.fromStatus(res.ok ? 400 : res.status, message, fieldErrors);
    }

    // Unwrap the standard `{ success, message, data }` envelope.
    return (body && typeof body === 'object' && 'success' in body ? body.data : body) as T;
  }
}

export const http = {
  get: <T>(path: string, opts?: RequestOptions) => request<T>('GET', path, opts),
  post: <T>(path: string, body?: unknown, opts?: RequestOptions) => request<T>('POST', path, { ...opts, body }),
  put: <T>(path: string, body?: unknown, opts?: RequestOptions) => request<T>('PUT', path, { ...opts, body }),
  patch: <T>(path: string, body?: unknown, opts?: RequestOptions) => request<T>('PATCH', path, { ...opts, body }),
  delete: <T>(path: string, opts?: RequestOptions) => request<T>('DELETE', path, opts),
};
