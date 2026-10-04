// Unified API Client — connects to FastAPI backend via Vite proxy (/api → http://localhost:8000)
// Mock mode is OFF by default. Toggle from the UI Settings if needed for offline demo.

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';
// When VITE_API_BASE_URL is empty (default), all /api/* requests go through the
// Vite dev-server proxy configured in vite.config.ts → target: http://localhost:8000

let useMockDataMode = false; // OFF — use real backend

export const setMockDataMode = (enabled: boolean) => {
  useMockDataMode = enabled;
};

export const isMockDataMode = () => useMockDataMode;

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('cloudscale_auth_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  if (useMockDataMode) {
    throw new Error('MOCK_MODE_ACTIVE');
  }

  const url = `${BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API Error ${response.status}: ${errorText || response.statusText}`);
  }

  return response.json() as Promise<T>;
}
