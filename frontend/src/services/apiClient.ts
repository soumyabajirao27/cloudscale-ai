// Unified API Client with base URL and JWT authentication middleware

// Default mock mode to false so we connect to the real FastAPI backend.
// Can be toggled if needed for demos.
let useMockDataMode = false;

export const setMockDataMode = (enabled: boolean) => {
  useMockDataMode = enabled;
};

export const isMockDataMode = () => useMockDataMode;

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const TOKEN_STORAGE_KEY = 'cloudscale_auth_token';

interface BaseResponseEnvelope<T> {
  success: boolean;
  message: string;
  data: T | null;
}

function isEnvelope<T>(payload: any): payload is BaseResponseEnvelope<T> {
  return (
    payload !== null &&
    typeof payload === 'object' &&
    !Array.isArray(payload) &&
    'success' in payload &&
    'message' in payload &&
    'data' in payload
  );
}

export async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  if (useMockDataMode) {
    throw new Error('MOCK_MODE_ACTIVE');
  }

  const token = localStorage.getItem(TOKEN_STORAGE_KEY);
  const headers = new Headers(options.headers);

  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const cleanedBaseUrl = BASE_URL.replace(/\/$/, '');
  const cleanedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${cleanedBaseUrl}${cleanedEndpoint}`;

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    // Token has expired or is invalid. Remove it.
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    throw new Error('UNAUTHORIZED');
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API Error ${response.status}: ${errorText || response.statusText}`);
  }

  const jsonPayload = await response.json();

  // Unwrap BaseResponse success envelope if present
  if (isEnvelope<T>(jsonPayload)) {
    if (!jsonPayload.success) {
      throw new Error(jsonPayload.message || 'API request failed');
    }
    return jsonPayload.data as T;
  }

  return jsonPayload as T;
}
