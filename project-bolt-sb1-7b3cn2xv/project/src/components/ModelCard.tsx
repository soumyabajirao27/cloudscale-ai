import { motion } from 'framer-motion';
import { AnimatedCounter } from './AnimatedCounter';

interface ModelCardProps {
  label: string;
  value: number;
  suffix?: string;
  decimals?: number;
  hint?: string;
  color?: string;
  delay?: number;
}

export function ModelCard({ label, value, suffix = '', decimals = 0, hint, color = '#6366F1', delay = 0 }: ModelCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ y: -3 }}
      className="glass-strong relative overflow-hidden rounded-2xl p-5 shadow-card"
    >
      <div className="absolute -right-6 -top-6 h-16 w-16 rounded-full opacity-20 blur-2xl" style={{ background: color }} />
      <p className="text-xs font-medium uppercase tracking-wider text-slate-400">{label}</p>
      <div className="mt-2 flex items-baseline gap-1">
        <AnimatedCounter value={value} decimals={decimals} suffix={suffix} className="text-2xl font-bold text-slate-50" />
      </div>
      {hint && <p className="mt-2 text-xs text-slate-500">{hint}</p>}
    </motion.div>
  );
}
