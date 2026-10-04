import React from 'react';
import { ResourceStatus } from '../../types/cloudscaler';
import { AlertTriangle, CheckCircle2, AlertOctagon, Info } from 'lucide-react';

interface StatusBadgeProps {
  status: ResourceStatus | 'HEALTHY' | 'CRITICAL' | 'WARNING' | 'HIGH' | 'MEDIUM' | 'LOW';
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  showIcon = true,
  size = 'md',
  className = ''
}) => {
  let styleClasses = '';
  let IconComponent = CheckCircle2;
  let label = status as string;

  switch (status) {
    case 'UNDERUTILIZED':
    case 'WARNING':
      styleClasses = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      IconComponent = AlertTriangle;
      label = status === 'UNDERUTILIZED' ? 'UNDERUTILIZED' : 'WARNING';
      break;

    case 'OPTIMAL':
    case 'HEALTHY':
      styleClasses = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      IconComponent = CheckCircle2;
      label = status === 'OPTIMAL' ? 'OPTIMAL' : 'HEALTHY';
      break;

    case 'OVERLOADED':
    case 'CRITICAL':
      styleClasses = 'bg-red-500/10 text-red-400 border-red-500/30 pulse-critical';
      IconComponent = AlertOctagon;
      label = status === 'OVERLOADED' ? 'OVERLOADED' : 'CRITICAL';
      break;

    case 'HIGH':
      styleClasses = 'bg-red-500/15 text-red-400 border-red-500/40 font-semibold';
      IconComponent = AlertOctagon;
      label = 'HIGH PRIORITY';
      break;

    case 'MEDIUM':
      styleClasses = 'bg-sky-500/10 text-sky-400 border-sky-500/30';
      IconComponent = Info;
      label = 'MEDIUM PRIORITY';
      break;

    case 'LOW':
      styleClasses = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      IconComponent = CheckCircle2;
      label = 'LOW PRIORITY';
      break;

    default:
      styleClasses = 'bg-slate-800 text-slate-300 border-slate-700';
  }

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1 font-mono',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-mono tracking-wide',
    lg: 'text-sm px-3.5 py-1.5 gap-2 font-mono tracking-wider font-semibold'
  }[size];

  return (
    <span
      className={`inline-flex items-center rounded-full border ${styleClasses} ${sizeClasses} ${className}`}
    >
      {showIcon && <IconComponent className={size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5'} />}
      <span>{label}</span>
    </span>
  );
};
