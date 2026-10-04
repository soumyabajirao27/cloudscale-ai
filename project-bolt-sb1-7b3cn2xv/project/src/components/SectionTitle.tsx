import type { ReactNode } from 'react';

interface SectionTitleProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  action?: ReactNode;
}

export function SectionTitle({ title, subtitle, icon, action }: SectionTitleProps) {
  return (
    <div className="flex items-start justify-between gap-4 mb-5">
      <div className="flex items-center gap-3">
        {icon && (
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary-soft">
            {icon}
          </div>
        )}
        <div>
          <h2 className="text-lg font-semibold text-slate-100">{title}</h2>
          {subtitle && <p className="text-sm text-slate-400 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}
