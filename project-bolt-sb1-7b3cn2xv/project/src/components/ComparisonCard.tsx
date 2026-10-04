import { motion } from 'framer-motion';

interface ComparisonCardProps {
  metric: string;
  traditional: string;
  ml: string;
  improvement: string;
  delay?: number;
}

export function ComparisonCard({ metric, traditional, ml, improvement, delay = 0 }: ComparisonCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ y: -3 }}
      className="glass-strong rounded-xl p-4 shadow-card"
    >
      <p className="text-sm font-semibold text-slate-100">{metric}</p>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <div className="rounded-lg bg-bg-base/60 p-3">
          <p className="text-[11px] uppercase tracking-wide text-slate-500">Traditional</p>
          <p className="mt-1 text-base font-bold text-slate-300">{traditional}</p>
        </div>
        <div className="rounded-lg bg-primary/10 p-3">
          <p className="text-[11px] uppercase tracking-wide text-primary-soft">ML-Based</p>
          <p className="mt-1 text-base font-bold text-primary-soft">{ml}</p>
        </div>
      </div>
      <p className="mt-3 text-xs font-semibold text-success">{improvement}</p>
    </motion.div>
  );
}
