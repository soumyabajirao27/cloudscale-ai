import { fetchApi } from './apiClient';

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: {
    email: string;
    name: string;
    role: string;
  };
}

export const authService = {
  // POST /api/v1/auth/login
  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      // 1. Call real login endpoint
      const tokenData = await fetchApi<{ access_token: string; token_type: string }>('/api/v1/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      // 2. Store the token so that apiClient can use it for the profile request
      localStorage.setItem('cloudscale_auth_token', tokenData.access_token);

      // 3. Fetch user details from /api/v1/users/me
      const profile = await fetchApi<any>('/api/v1/users/me');

      return {
        access_token: tokenData.access_token,
        token_type: tokenData.token_type,
        user: {
          email: profile.email,
          name: profile.full_name || profile.email.split('@')[0],
          role: profile.is_superuser ? 'Administrator' : 'Operations Engineer',
        },
      };
    } catch (err: any) {
      if (err.message === 'MOCK_MODE_ACTIVE') {
        // Return simulated token for demo authentication if mock mode is manually toggled
        return {
          access_token: 'mock_jwt_token_cloudscaler_demo_2026',
          token_type: 'bearer',
          user: {
            email: email,
            name: email.split('@')[0].toUpperCase() || 'Admin User',
            role: 'Cloud Operations Lead',
          },
        };
      }
      throw new Error(err.message || 'Invalid email or password');
    }
  },
};
