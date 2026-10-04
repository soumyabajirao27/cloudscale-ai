import { fetchApi } from './apiClient';

export interface LoginResponse {
  access_token: string;
  token_type: string;
  // /api/v1/auth/login returns only token fields; /api/v1/auth/me returns user profile
  user?: {
    email: string;
    full_name: string;
    is_superuser: boolean;
  };
}

export interface UserProfile {
  id: number;
  email: string;
  full_name: string;
  is_active: boolean;
  is_superuser: boolean;
}

export const authService = {
  // POST /api/v1/auth/login  →  { access_token, token_type }
  async login(email: string, password: string): Promise<LoginResponse> {
    const tokenResponse = await fetchApi<{ access_token: string; token_type: string }>(
      '/api/v1/auth/login',
      {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }
    );

    // Persist token so subsequent fetchApi calls attach the Authorization header
    localStorage.setItem('cloudscale_auth_token', tokenResponse.access_token);

    // Fetch the user profile now that we have a valid token
    const profile = await fetchApi<UserProfile>('/api/v1/auth/me');

    return {
      access_token: tokenResponse.access_token,
      token_type: tokenResponse.token_type,
      user: {
        email: profile.email,
        full_name: profile.full_name,
        is_superuser: profile.is_superuser,
      },
    };
  },

  logout() {
    localStorage.removeItem('cloudscale_auth_token');
  },

  isLoggedIn(): boolean {
    return !!localStorage.getItem('cloudscale_auth_token');
  },
};
