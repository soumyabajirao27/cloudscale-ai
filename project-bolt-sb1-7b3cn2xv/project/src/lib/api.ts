/**
 * Centralized Axios API client for the CloudScale AI frontend.
 *
 * Configuration:
 *  - Base URL  : VITE_API_URL env var  (fallback: http://localhost:8000)
 *  - API prefix: /api/v1              (prepended to every request)
 *  - Auth      : Bearer JWT read from localStorage (attached when present)
 *  - Envelope  : Backend BaseResponse { success, message, data } is unwrapped
 *                so that response.data gives the inner payload directly.
 *
 * @see backend/app/schemas/response.py
 */

import axios, {
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';

/* ------------------------------------------------------------------ *
 * Constants
 * ------------------------------------------------------------------ */

/** localStorage key for the JWT access token (populated by the auth layer). */
export const TOKEN_STORAGE_KEY = 'cloudscale_auth_token';

/** Matches the backend BaseResponse envelope (see backend/app/schemas/response.py). */
export interface BaseResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T | null;
}

/* ------------------------------------------------------------------ *
 * Client instance
 * ------------------------------------------------------------------ */

const BASE_URL: string =
  import.meta.env.VITE_API_URL || 'http://localhost:8000';

const API_PREFIX = '/api/v1';

const api: AxiosInstance = axios.create({
  baseURL: `${BASE_URL}${API_PREFIX}`,
  headers: {
    'Content-Type': 'application/json',
  },
});

/* ------------------------------------------------------------------ *
 * Helpers
 * ------------------------------------------------------------------ */

/** Safely read the JWT from localStorage (null if missing or unavailable). */
function getStoredToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

/** Type guard: does the payload look like a BaseResponse envelope? */
function isEnvelope(payload: unknown): payload is BaseResponse {
  return (
    payload !== null &&
    typeof payload === 'object' &&
    !Array.isArray(payload) &&
    'success' in payload &&
    'message' in payload &&
    'data' in payload
  );
}

/* ------------------------------------------------------------------ *
 * Request interceptor — attach Bearer token
 * ------------------------------------------------------------------ */

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getStoredToken();
    if (token) {
      config.headers.set('Authorization', `Bearer ${token}`);
    }
    return config;
  },
  (error) => Promise.reject(error),
);

/* ------------------------------------------------------------------ *
 * Response interceptor — unwrap BaseResponse envelope
 * ------------------------------------------------------------------ */

api.interceptors.response.use(
  (response: AxiosResponse) => {
    const payload = response.data;

    if (isEnvelope(payload)) {
      const { success, message } = payload;

      // Unwrap: response.data becomes the inner payload so callers can
      // access it directly (e.g. api.get('/resources') → the resource list).
      response.data = payload.data ?? null;

      // Preserve envelope-level metadata for callers that need the message.
      (
        response as AxiosResponse & {
          meta?: { success: boolean; message: string };
        }
      ).meta = { success, message };
    }

    return response;
  },
  (error) => {
    // Let Axios HTTP errors propagate untouched so existing error-handling
    // patterns (error.response?.status, etc.) continue to work.
    return Promise.reject(error);
  },
);

export default api;
