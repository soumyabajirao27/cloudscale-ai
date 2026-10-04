import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import { AlertCircle, Cloud, UserPlus } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';

/** Backend password policy (see backend/app/schemas/base.py). */
function validatePassword(password: string): string | null {
  if (password.length < 8) return 'Password must be at least 8 characters long.';
  if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter.';
  if (!/[a-z]/.test(password)) return 'Password must contain at least one lowercase letter.';
  if (!/\d/.test(password)) return 'Password must contain at least one digit.';
  return null;
}

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!fullName.trim()) {
      setError('Full name is required.');
      return;
    }
    if (!email.trim()) {
      setError('Email is required.');
      return;
    }
    const pwError = validatePassword(password);
    if (pwError) {
      setError(pwError);
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await register(fullName.trim(), email.trim(), password);
      // Registration succeeds without a token; direct the user to log in.
      navigate('/login', { replace: true });
    } catch (err) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Registration failed. Please try again.';
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

          <h2 className="mb-1 text-center text-lg font-semibold text-slate-100">Create account</h2>
          <p className="mb-6 text-center text-sm text-slate-400">Register to manage your cloud resources</p>

          {error && (
            <div className="mb-4 flex items-start gap-2 rounded-xl border border-danger/30 bg-danger/10 px-3 py-2.5 text-sm text-danger">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="fullName" className="mb-1.5 block text-sm font-medium text-slate-300">
                Full name
              </label>
              <input
                id="fullName"
                type="text"
                autoComplete="name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Jane Doe"
                className="w-full rounded-xl border border-slate-700 bg-bg-base/60 px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 outline-none transition-colors focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
              />
            </div>

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
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-700 bg-bg-base/60 px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 outline-none transition-colors focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
              />
              <p className="mt-1.5 text-xs text-slate-500">
                Minimum 8 characters with at least one uppercase letter, one lowercase letter, and one digit.
              </p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="mb-1.5 block text-sm font-medium text-slate-300">
                Confirm password
              </label>
              <input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
                  Creating account…
                </>
              ) : (
                <>
                  <UserPlus size={16} />
                  Create account
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-primary-soft hover:text-primary transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
