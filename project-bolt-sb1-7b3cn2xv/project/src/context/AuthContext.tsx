/**
 * Authentication context provider.
 *
 * On mount, checks localStorage for a JWT (cloudscale_auth_token).
 *  - If a token exists, calls GET /auth/me to restore the user.
 *    - Valid   -> user restored, isAuthenticated = true
 *    - Invalid -> token removed, treated as logged out
 *  - If no token, stays logged out.
 */

import { TOKEN_STORAGE_KEY } from '@/lib/api';
import { login as apiLogin, logout as apiLogout, register as apiRegister, getCurrentUser, type User } from '@/services/auth';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (full_name: string, email: string, password: string) => Promise<User>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /** Restore session from localStorage on startup. */
  useEffect(() => {
    let cancelled = false;

    async function restore() {
      const token = localStorage.getItem(TOKEN_STORAGE_KEY);
      if (!token) {
        if (!cancelled) setIsLoading(false);
        return;
      }

      try {
        const currentUser = await getCurrentUser();
        if (!cancelled) setUser(currentUser);
      } catch {
        // Invalid/expired token -> clear it and treat as logged out.
        apiLogout();
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    restore();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const loggedInUser = await apiLogin(email, password);
    setUser(loggedInUser);
    return loggedInUser;
  }, []);

  const register = useCallback(async (full_name: string, email: string, password: string) => {
    return apiRegister(full_name, email, password);
  }, []);

  const logout = useCallback(() => {
    apiLogout();
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      register,
      logout,
    }),
    [user, isLoading, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
