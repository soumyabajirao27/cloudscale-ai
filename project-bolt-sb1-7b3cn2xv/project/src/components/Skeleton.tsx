export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`skeleton rounded-lg ${className}`} />;
}

export function SkeletonCard({ delay = 0 }: { delay?: number }) {
  return (
    <div className="glass-strong rounded-2xl p-5 shadow-card" style={{ animationDelay: `${delay}ms` }}>
      <Skeleton className="h-3 w-24" />
      <Skeleton className="mt-3 h-8 w-32" />
      <Skeleton className="mt-4 h-6 w-full" />
    </div>
  );
}
