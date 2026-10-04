import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  subtitle: string;
  icon?: ReactNode;
  action?: ReactNode;
}

export function PageHeader({ title, subtitle, icon, action }: PageHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex items-center gap-3">
        {icon && (
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/25 to-primary/5 text-primary-soft shadow-glow-soft">
            {icon}
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-50 md:text-3xl">{title}</h1>
          <p className="mt-1 text-sm text-slate-400">{subtitle}</p>
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </motion.div>
  );
}
