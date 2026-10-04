import { motion } from 'framer-motion';
import type { ActivityItem } from '@/data/mockData';

const typeColor: Record<ActivityItem['type'], string> = {
  scale: '#6366F1',
  cost: '#10B981',
  predict: '#06B6D4',
  anomaly: '#EF4444',
  system: '#A855F7',
};

interface TimelineProps {
  items: ActivityItem[];
}

export function Timeline({ items }: TimelineProps) {
  return (
    <div className="relative pl-6">
      <div className="absolute left-2 top-1 bottom-1 w-px bg-slate-700/60" />
      {items.map((item, i) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.08, duration: 0.4 }}
          className="relative mb-5 last:mb-0"
        >
          <span
            className="absolute -left-[18px] top-1.5 h-3 w-3 rounded-full border-2 border-bg-base"
            style={{ background: typeColor[item.type] }}
          />
          <p className="text-sm font-semibold text-slate-100">{item.title}</p>
          <p className="text-xs text-slate-400 mt-0.5">{item.detail}</p>
          <p className="text-[11px] text-slate-500 mt-1">{item.time}</p>
        </motion.div>
      ))}
    </div>
  );
}
