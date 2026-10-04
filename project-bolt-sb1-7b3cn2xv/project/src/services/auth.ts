/**
 * Authentication service.
 *
 * Wraps the backend auth endpoints using the shared Axios client (src/lib/api.ts).
 * The client automatically attaches `Authorization: Bearer <token>` from
 * localStorage (key: cloudscale_auth_token) on every request.
 *
 * Backend endpoints (all under /api/v1):
 *   POST /auth/login     -> { access_token, token_type }
 *   POST /auth/register  -> UserResponse
 *   GET  /auth/me        -> UserResponse
 */

import api, { TOKEN_STORAGE_KEY } from '@/lib/api';

/** Public user shape returned by the backend (see backend/app/schemas/user.py). */
export interface User {
  id: number;
  full_name: string;
  email: string;
  is_active: boolean;
  is_superuser: boolean;
  created_at: string;
  updated_at: string;
}

/** Token payload returned by POST /auth/login. */
interface TokenResponse {
  access_token: string;
  token_type: string;
}

/**
 * Authenticate a user and persist the JWT.
 * On success the token is stored under `cloudscale_auth_token` and the
 * current user profile is fetched and returned.
 */
export async function login(email: string, password: string): Promise<User> {
  const { data } = await api.post<TokenResponse>('/auth/login', { email, password });
  localStorage.setItem(TOKEN_STORAGE_KEY, data.access_token);
  return getCurrentUser();
}

/** Register a new user account. Returns the created user (no token issued). */
export async function register(
  full_name: string,
  email: string,
  password: string,
): Promise<User> {
  const { data } = await api.post<User>('/auth/register', { full_name, email, password });
  return data;
}

/** Fetch the currently authenticated user's profile (requires a valid token). */
export async function getCurrentUser(): Promise<User> {
  const { data } = await api.get<User>('/auth/me');
  return data;
}

/** Clear the stored JWT. */
export function logout(): void {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
}
