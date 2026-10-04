import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import { AlertCircle, Cloud, LogIn } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const from = (location.state as { from?: string } | null)?.from ?? '/';

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError('Email is required.');
      return;
    }
    if (!password) {
      setError('Password is required.');
      return;
    }

    setLoading(true);
    try {
      await login(email.trim(), password);
      navigate(from, { replace: true });
    } catch (err) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Login failed. Please check your credentials and try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app-bg flex min-h-screen items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md"
      >
        <div className="glass-strong rounded-2xl p-8 shadow-card">
          {/* Logo */}
          <div className="mb-6 flex flex-col items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-soft shadow-glow">
              <Cloud size={24} className="text-white" />
            </div>
            <div className="text-center">
              <h1 className="text-xl font-bold tracking-tight text-slate-100">CloudScaler</h1>
              <p className="text-xs uppercase tracking-widest text-primary-soft">AI Cloud Ops</p>
            </div>
          </div>

          <h2 className="mb-1 text-center text-lg font-semibold text-slate-100">Sign in</h2>
          <p className="mb-6 text-center text-sm text-slate-400">Access your cloud management dashboard</p>

          {error && (
            <div className="mb-4 flex items-start gap-2 rounded-xl border border-danger/30 bg-danger/10 px-3 py-2.5 text-sm text-danger">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-300">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-slate-700 bg-bg-base/60 px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 outline-none transition-colors focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-slate-300">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-700 bg-bg-base/60 px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 outline-none transition-colors focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary-soft px-6 py-2.5 text-sm font-semibold text-white shadow-glow transition-shadow hover:shadow-glow-soft disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Signing in…
                </>
              ) : (
                <>
                  <LogIn size={16} />
                  Sign in
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-400">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-primary-soft hover:text-primary transition-colors">
              Register
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
