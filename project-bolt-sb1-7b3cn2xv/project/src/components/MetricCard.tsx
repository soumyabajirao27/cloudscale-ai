import { motion } from 'framer-motion';
import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';
import { AnimatedCounter } from './AnimatedCounter';
import type { MetricSummary } from '@/data/mockData';
import { Sparkline } from './Sparkline';

const trendIcon = {
  up: <ArrowUpRight size={14} />,
  down: <ArrowDownRight size={14} />,
  flat: <Minus size={14} />,
};

const trendColor = {
  up: 'text-success',
  down: 'text-danger',
  flat: 'text-slate-400',
};

interface MetricCardProps extends MetricSummary {
  icon?: React.ReactNode;
  delay?: number;
}

export function MetricCard({ label, value, unit, trend, delta, color, spark, delay = 0 }: MetricCardProps) {
  const decimals = value < 100 && !Number.isInteger(value) ? 1 : 0;
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4 }}
      className="glass-strong relative overflow-hidden rounded-2xl p-5 shadow-card group"
    >
      <div
        className="absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-20 blur-2xl transition-opacity group-hover:opacity-40"
        style={{ background: color }}
      />
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">{label}</p>
          <div className="mt-2 flex items-baseline gap-1">
            <AnimatedCounter
              value={value}
              decimals={decimals}
              className="text-2xl font-bold text-slate-50"
            />
            <span className="text-sm font-medium text-slate-400">{unit}</span>
          </div>
        </div>
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl"
          style={{ background: `${color}22`, color }}
        >
          <div className="h-2.5 w-2.5 rounded-full" style={{ background: color }} />
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <div className={`flex items-center gap-1 text-xs font-semibold ${trendColor[trend]}`}>
          {trendIcon[trend]}
          <span>
            {delta > 0 ? '+' : ''}
            {delta}
          </span>
        </div>
        <Sparkline data={spark} color={color} />
      </div>
    </motion.div>
  );
}
