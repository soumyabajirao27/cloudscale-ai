/**
 * Route guard for authenticated pages.
 *
 * - While the auth session is being restored, shows a lightweight loading state.
 * - If the user is not authenticated, redirects to /login.
 * - Otherwise renders the protected content.
 */

import { useAuth } from '@/context/AuthContext';
import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="app-bg flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-slate-400">Loading…</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
}
