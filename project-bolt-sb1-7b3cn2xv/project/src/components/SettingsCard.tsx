import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface SettingsCardProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  children: ReactNode;
  delay?: number;
}

export function SettingsCard({ title, description, icon, children, delay = 0 }: SettingsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="glass-strong rounded-2xl p-6 shadow-card"
    >
      <div className="flex items-center gap-3 mb-4">
        {icon && (
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary-soft">
            {icon}
          </div>
        )}
        <div>
          <h3 className="font-semibold text-slate-100">{title}</h3>
          {description && <p className="text-xs text-slate-400 mt-0.5">{description}</p>}
        </div>
      </div>
      <div className="space-y-4">{children}</div>
    </motion.div>
  );
}
