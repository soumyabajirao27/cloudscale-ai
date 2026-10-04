import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import { Bell, Cloud, HeartPulse, LogOut, Menu, Server, Settings, User as UserIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { StatusBadge } from './StatusBadge';

export function Header({ onMenuClick }: { onMenuClick: () => void }) {
  const [now, setNow] = useState(new Date());
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-slate-800/60 bg-bg-base/70 px-4 backdrop-blur-xl md:px-6">
      <button
        onClick={onMenuClick}
        className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-300 hover:bg-slate-800 md:hidden"
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>

      <div className="flex items-center gap-2 md:hidden">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary-soft">
          <Cloud size={16} className="text-white" />
        </div>
        <span className="font-bold text-slate-100">CloudScaler</span>
      </div>

      <div className="ml-auto flex items-center gap-2 md:gap-3">
        <div className="hidden items-center gap-2 rounded-xl border border-slate-800 bg-bg-card/60 px-3 py-1.5 sm:flex">
          <span className="text-xs text-slate-400">UTC</span>
          <motion.span
            key={timeStr}
            initial={{ opacity: 0.5 }}
            animate={{ opacity: 1 }}
            className="font-mono text-sm font-semibold tabular-nums text-slate-100"
          >
            {timeStr}
          </motion.span>
        </div>

        <div className="hidden items-center gap-2 rounded-xl border border-slate-800 bg-bg-card/60 px-3 py-1.5 lg:flex">
          <Server size={14} className="text-primary-soft" />
          <span className="text-xs text-slate-400">Instances</span>
          <span className="text-sm font-bold text-slate-100">24</span>
        </div>

        <div className="hidden items-center gap-2 rounded-xl border border-slate-800 bg-bg-card/60 px-3 py-1.5 lg:flex">
          <HeartPulse size={14} className="text-success" />
          <StatusBadge variant="success" pulse>Healthy</StatusBadge>
        </div>

        {/* Logged-in user */}
        {user && (
          <div className="hidden items-center gap-2 rounded-xl border border-slate-800 bg-bg-card/60 px-3 py-1.5 lg:flex">
            <UserIcon size={14} className="text-primary-soft" />
            <span className="max-w-[140px] truncate text-sm font-semibold text-slate-100">{user.full_name}</span>
          </div>
        )}

        <button className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-slate-800 bg-bg-card/60 text-slate-300 hover:text-slate-100 hover:border-primary/40 transition-colors">
          <Bell size={18} />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-danger ring-2 ring-bg-base" />
        </button>

        <button className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-800 bg-bg-card/60 text-slate-300 hover:text-slate-100 hover:border-primary/40 transition-colors">
          <Settings size={18} />
        </button>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-800 bg-bg-card/60 text-slate-300 hover:text-danger hover:border-danger/40 transition-colors"
          aria-label="Log out"
          title="Log out"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}
