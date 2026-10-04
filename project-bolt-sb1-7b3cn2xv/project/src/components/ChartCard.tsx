import type { ReactNode } from 'react';
import { GlassCard } from './GlassCard';
import { SectionTitle } from './SectionTitle';

interface ChartCardProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  delay?: number;
}

export function ChartCard({ title, subtitle, icon, action, children, className = '', delay = 0 }: ChartCardProps) {
  return (
    <GlassCard className={`p-5 ${className}`} delay={delay}>
      <SectionTitle title={title} subtitle={subtitle} icon={icon} action={action} />
      <div className="mt-2">{children}</div>
    </GlassCard>
  );
}
