import React, { useState } from 'react';
import { authService } from '../services/authService';
import { Cloud, Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';

interface LoginViewProps {
  onLoginSuccess: (userEmail: string, token: string) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState<string>('http_test@test.com');
  const [password, setPassword] = useState<string>('StrongPass1');
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await authService.login(email, password);
      onLoginSuccess(res.user.email, res.access_token);
    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed. Check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090d16] flex items-center justify-center p-4 selection:bg-sky-500 selection:text-white">
      <div className="w-full max-w-md space-y-8">
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 items-center justify-center text-white shadow-xl shadow-sky-500/20 mb-2">
            <Cloud className="w-7 h-7" />
          </div>
          <h1 className="text-3xl font-bold text-slate-100 tracking-tight font-mono">CloudScaler</h1>
          <p className="text-xs text-sky-400 font-mono tracking-widest uppercase font-semibold">
            AI-Powered Cloud Operations
          </p>
        </div>

        {/* Form Container */}
        <div className="p-8 rounded-2xl bg-[#0f172a] border border-slate-800 shadow-2xl space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <h2 className="text-base font-bold text-slate-200 font-mono">Operations Console Sign In</h2>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Designed for existing endpoint: <code className="text-sky-400">POST /api/v1/auth/login</code>
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-lg bg-red-950/40 border border-red-900/60 text-red-300 text-xs font-mono">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 font-mono">
            {/* Email Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500"
                  placeholder="http_test@test.com"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-xs text-slate-400">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded bg-slate-900 border-slate-800 text-sky-500 focus:ring-0" />
                <span>Remember Me</span>
              </label>
              <a href="#" onClick={(e) => e.preventDefault()} className="text-sky-400 hover:underline">
                Forgot password?
              </a>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-lg text-xs transition-all shadow-lg shadow-sky-500/20 disabled:opacity-50 mt-2"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In to Operations Center'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Pre-fill helper */}
          <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-[11px] font-mono text-slate-400 text-center">
            Demo Credentials Pre-filled • Click Sign In to launch
          </div>
        </div>
      </div>
    </div>
  );
};
