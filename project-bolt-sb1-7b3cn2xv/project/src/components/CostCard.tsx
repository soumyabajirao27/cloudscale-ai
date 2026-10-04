import { motion } from 'framer-motion';
import { AnimatedCounter } from './AnimatedCounter';

interface CostCardProps {
  label: string;
  value: number;
  hint: string;
  color: string;
  prefix?: string;
  delay?: number;
}

export function CostCard({ label, value, hint, color, prefix = '$', delay = 0 }: CostCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay }}
      whileHover={{ y: -4 }}
      className="glass-strong relative overflow-hidden rounded-2xl p-5 shadow-card"
    >
      <div
        className="absolute -left-6 -bottom-6 h-20 w-20 rounded-full opacity-20 blur-2xl"
        style={{ background: color }}
      />
      <p className="text-xs font-medium uppercase tracking-wider text-slate-400">{label}</p>
      <div className="mt-2 flex items-baseline gap-0.5">
        <span className="text-sm font-semibold text-slate-400">{prefix}</span>
        <AnimatedCounter value={value} className="text-2xl font-bold text-slate-50" />
      </div>
      <p className="mt-2 text-xs text-slate-500">{hint}</p>
    </motion.div>
  );
}
