type Variant = 'success' | 'warning' | 'danger' | 'primary' | 'neutral';

const variants: Record<Variant, string> = {
  success: 'bg-success/15 text-success border-success/30',
  warning: 'bg-warning/15 text-warning border-warning/30',
  danger: 'bg-danger/15 text-danger border-danger/30',
  primary: 'bg-primary/15 text-primary-soft border-primary/30',
  neutral: 'bg-slate-500/15 text-slate-300 border-slate-500/30',
};

interface StatusBadgeProps {
  variant: Variant;
  children: React.ReactNode;
  pulse?: boolean;
}

export function StatusBadge({ variant, children, pulse = false }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${variants[variant]}`}
    >
      {pulse && <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-60" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-current" />
      </span>}
      {children}
    </span>
  );
}
