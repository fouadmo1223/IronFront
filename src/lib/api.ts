import axios, { AxiosError, type AxiosInstance } from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';

export interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: Record<string, unknown>;
}

const ACCESS_KEY = 'iron_gym_access';
const REFRESH_KEY = 'iron_gym_refresh';

export const tokenStore = {
  get access() {
    return typeof window === 'undefined' ? null : localStorage.getItem(ACCESS_KEY);
  },
  get refresh() {
    return typeof window === 'undefined' ? null : localStorage.getItem(REFRESH_KEY);
  },
  set(access: string, refresh: string) {
    localStorage.setItem(ACCESS_KEY, access);
    localStorage.setItem(REFRESH_KEY, refresh);
  },
  clear() {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
  },
};

export const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = tokenStore.access;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let refreshing: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refresh = tokenStore.refresh;
  if (!refresh) return null;
  try {
    const { data } = await axios.post<ApiEnvelope<{ accessToken: string; refreshToken: string }>>(
      `${BASE_URL}/auth/refresh`,
      { refreshToken: refresh },
    );
    tokenStore.set(data.data.accessToken, data.data.refreshToken);
    return data.data.accessToken;
  } catch {
    tokenStore.clear();
    return null;
  }
}

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as (typeof error.config & { _retried?: boolean }) | undefined;
    if (error.response?.status === 401 && original && !original._retried) {
      original._retried = true;
      refreshing ??= refreshAccessToken().finally(() => {
        refreshing = null;
      });
      const newToken = await refreshing;
      if (newToken) {
        original.headers = original.headers ?? {};
        original.headers.Authorization = `Bearer ${newToken}`;
        return api.request(original);
      }
    }
    return Promise.reject(error);
  },
);

export function unwrap<T>(promise: Promise<{ data: ApiEnvelope<T> }>): Promise<T> {
  return promise.then((r) => r.data.data);
}

export function apiErrorMessage(error: unknown, fallback = 'Something went wrong'): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string } | undefined;
    return data?.message ?? error.message ?? fallback;
  }
  return fallback;
}

/**
 * Maps a known (English) backend error message to a bare key under the
 * `apiErrors` i18n namespace, so callers can localise it. Returns null for
 * anything unrecognised — the caller then falls back to the raw message.
 */
const API_ERROR_PATTERNS: Array<[RegExp, string]> = [
  [/account with this email already exists/i, 'emailExists'],
  [/invalid email or password/i, 'invalidCredentials'],
  [/account has been banned|your account has been banned|banned from/i, 'banned'],
  [/account is disabled/i, 'accountDisabled'],
  [/account not found/i, 'accountNotFound'],
  [/(phone).*(already|exists|taken)|duplicate value for .*phone/i, 'phoneExists'],
  [/could not allocate a unique member code|member profile creation failed/i, 'registrationFailed'],
  [/validation failed/i, 'validation'],
  [/too many requests|rate limit/i, 'rateLimited'],
];

export function apiErrorKey(error: unknown): string | null {
  if (!axios.isAxiosError(error)) return null;
  const msg = (error.response?.data as { message?: string } | undefined)?.message ?? '';
  for (const [re, key] of API_ERROR_PATTERNS) if (re.test(msg)) return key;
  return null;
}
