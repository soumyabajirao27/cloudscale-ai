import { NavLink } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
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
  X,
  Cloud,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { navItems } from '@/data/mockData';

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
};

interface MobileNavProps {
  open: boolean;
  onClose: () => void;
}

export function MobileNav({ open, onClose }: MobileNavProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          />
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            className="fixed left-0 top-0 z-50 flex h-screen w-[260px] flex-col border-r border-slate-800 bg-bg-sidebar md:hidden"
          >
            <div className="flex h-16 items-center justify-between px-4">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-soft">
                  <Cloud size={18} className="text-white" />
                </div>
                <span className="font-bold text-slate-100">CloudScaler</span>
              </div>
              <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800">
                <X size={18} />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto px-3 py-2">
              <ul className="space-y-1">
                {navItems.map((item) => {
                  const Icon = iconMap[item.icon];
                  return (
                    <li key={item.id}>
                      <NavLink
                        to={`/${item.id === 'dashboard' ? '' : item.id}`}
                        end={item.id === 'dashboard'}
                        onClick={onClose}
                        className={({ isActive }) =>
                          `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium ${
                            isActive ? 'bg-primary/20 text-white' : 'text-slate-400 hover:text-slate-200'
                          }`
                        }
                      >
                        <Icon size={18} />
                        {item.label}
                      </NavLink>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
