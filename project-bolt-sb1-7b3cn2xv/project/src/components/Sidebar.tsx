import { navItems } from '@/data/mockData';
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import {
  Activity,
  BrainCircuit,
  ChevronLeft,
  Cloud,
  Columns2,
  DollarSign,
  GitBranch,
  Info,
  LayoutDashboard,
  Lightbulb,
  Settings,
  Sparkles,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';

const iconMap: Record<string, LucideIcon> = {
  LayoutDashboard,
  Sparkles,
  DollarSign,
  GitBranch,
  Columns2,
  Activity,
  BrainCircuit,
  Lightbulb,
  Settings,
  Info,
  Cloud,
};

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  return (
    <motion.aside
      animate={{ width: collapsed ? 76 : 264 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="sticky top-0 z-30 hidden h-screen shrink-0 flex-col border-r border-slate-800/60 bg-bg-sidebar/80 backdrop-blur-xl md:flex"
    >
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 px-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-soft shadow-glow">
          <Cloud size={20} className="text-white" />
        </div>
        {!collapsed && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="overflow-hidden">
            <p className="text-sm font-bold tracking-tight text-slate-100">CloudScaler</p>
            <p className="text-[10px] uppercase tracking-widest text-primary-soft">AI Cloud Ops</p>
          </motion.div>
        )}
      </div>

      {/* Toggle */}
      <button
        onClick={onToggle}
        className="mx-auto mb-2 flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
        aria-label="Toggle sidebar"
      >
        <ChevronLeft size={16} className={`transition-transform ${collapsed ? 'rotate-180' : ''}`} />
      </button>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 pb-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = iconMap[item.icon];
            return (
              <li key={item.id}>
                <NavLink
                  to={`/${item.id === 'dashboard' ? '' : item.id}`}
                  end={item.id === 'dashboard'}
                  className={({ isActive }) =>
                    `group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                      isActive ? 'text-white' : 'text-slate-400 hover:text-slate-200'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <motion.div
                          layoutId="nav-active"
                          className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/25 to-primary/5 border border-primary/30"
                          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                        />
                      )}
                      <span className="relative z-10 flex h-5 w-5 items-center justify-center">
                        <Icon size={18} />
                      </span>
                      {!collapsed && <span className="relative z-10">{item.label}</span>}
                    </>
                  )}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="border-t border-slate-800/60 p-4">
          <div className="rounded-xl bg-bg-elevated/60 p-3">
            <p className="text-[11px] text-slate-400">Model Version</p>
            <p className="text-sm font-semibold text-slate-200">LSTM v2.4.1</p>
            <div className="mt-2 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
              <span className="text-[11px] text-success">Active &amp; healthy</span>
            </div>
          </div>
        </div>
      )}
    </motion.aside>
  );
}
