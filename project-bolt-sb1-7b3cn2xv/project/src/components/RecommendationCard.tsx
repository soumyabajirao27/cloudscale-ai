import { motion } from 'framer-motion';
import { ArrowUpCircle, ArrowDownCircle, PauseCircle } from 'lucide-react';
import type { ScalingRec } from '@/data/mockData';
import { StatusBadge } from './StatusBadge';

const urgencyVariant = {
  critical: 'danger',
  high: 'warning',
  medium: 'primary',
  low: 'neutral',
} as const;

const actionIcon = {
  'scale-up': <ArrowUpCircle size={20} />,
  'scale-down': <ArrowDownCircle size={20} />,
  hold: <PauseCircle size={20} />,
};

const actionColor = {
  'scale-up': '#10B981',
  'scale-down': '#F59E0B',
  hold: '#64748B',
};

interface RecommendationCardProps {
  rec: ScalingRec;
  delay?: number;
}

export function RecommendationCard({ rec, delay = 0 }: RecommendationCardProps) {
  const color = actionColor[rec.action];
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ y: -3 }}
      className="glass-strong rounded-2xl p-5 shadow-card"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl" style={{ background: `${color}22`, color }}>
            {actionIcon[rec.action]}
          </div>
          <div>
            <p className="font-semibold text-slate-100">{rec.resource}</p>
            <p className="text-xs text-slate-400 mt-0.5">{rec.reason}</p>
          </div>
        </div>
        <StatusBadge variant={urgencyVariant[rec.urgency]} pulse={rec.urgency === 'critical'}>
          {rec.urgency}
        </StatusBadge>
      </div>

      <div className="mt-4 flex items-center justify-between rounded-xl bg-bg-base/50 px-4 py-3">
        <div className="text-center">
          <p className="text-xs text-slate-500">Current</p>
          <p className="text-lg font-bold text-slate-100">{rec.from}</p>
        </div>
        <div className="flex-1 mx-4 flex items-center">
          <div className="h-px flex-1 bg-slate-700" />
          <span className="px-2 text-xs font-semibold" style={{ color }}>→</span>
          <div className="h-px flex-1 bg-slate-700" />
        </div>
        <div className="text-center">
          <p className="text-xs text-slate-500">Target</p>
          <p className="text-lg font-bold" style={{ color }}>{rec.to}</p>
        </div>
        <div className="ml-6 text-right">
          <p className="text-xs text-slate-500">ETA</p>
          <p className="text-sm font-semibold text-slate-300">{rec.eta}</p>
        </div>
      </div>
    </motion.div>
  );
}
