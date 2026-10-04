import { AnimatedCounter } from '@/components/AnimatedCounter';
import { ChartCard } from '@/components/ChartCard';
import { baseChartOptions, Line } from '@/components/Charts';
import { GlassCard } from '@/components/GlassCard';
import { MetricCard } from '@/components/MetricCard';
import { PageHeader } from '@/components/PageHeader';
import { SectionTitle } from '@/components/SectionTitle';
import { Skeleton, SkeletonCard } from '@/components/Skeleton';
import { StatusBadge } from '@/components/StatusBadge';
import { getResourceMetrics, getResources, syncResources, type Resource, type ResourceMetric } from '@/services/resources';
import { motion } from 'framer-motion';
import { Activity, AlertCircle, Cpu, DollarSign, GitBranch, RefreshCw, TrendingUp } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

const COLORS = {
  cpu: '#EF4444',
  memory: '#06B6D4',
  network: '#3B82F6',
  storage: '#A855F7',
  cost: '#10B981',
  capacity: '#EC4899',
};

function formatTime(ts: string): string {
  try {
    return new Date(ts).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  } catch {
    return ts;
  }
}

export function DashboardPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [metrics, setMetrics] = useState<ResourceMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState<string | null>(null);

  const loadResources = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getResources();
      setResources(data);
      if (data.length > 0) {
        const m = await getResourceMetrics(data[0].id);
        setMetrics(m);
      } else {
        setMetrics([]);
      }
    } catch (err) {
      setError((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to load resources.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadResources();
  }, [loadResources]);

  const handleSync = useCallback(async () => {
    setSyncing(true);
    setSyncMsg(null);
    setError(null);
    try {
      const result = await syncResources(true);
      setSyncMsg(`${result.created} created · ${result.updated} updated · ${result.unchanged} unchanged · provider: ${result.provider}`);
      await loadResources();
    } catch (err) {
      const status = (err as { response?: { status?: number; data?: { message?: string } } })?.response?.status;
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      if (status === 401) {
        setError('Authentication required. Please log in again.');
      } else if (status === 403) {
        setError('Permission denied. You cannot sync resources.');
      } else {
        setError(msg ?? 'Sync failed.');
      }
      // Preserve existing resource data on failure — do NOT reload.
      setSyncMsg(null);
    } finally {
      setSyncing(false);
    }
  }, [loadResources]);

  const primary = resources[0] ?? null;

  const metricCards = useMemo(() => {
    if (!primary) return [];
    return [
      { id: 'cpu', label: 'CPU Usage', value: primary.cpu_utilization, unit: '%', trend: 'flat' as const, delta: 0, color: COLORS.cpu, spark: metrics.map((m) => m.cpu_utilization) },
      { id: 'memory', label: 'Memory Usage', value: primary.memory_utilization, unit: '%', trend: 'flat' as const, delta: 0, color: COLORS.memory, spark: metrics.map((m) => m.memory_utilization) },
      { id: 'network', label: 'Network I/O', value: primary.network_utilization, unit: '%', trend: 'flat' as const, delta: 0, color: COLORS.network, spark: metrics.map((m) => m.network_utilization) },
      { id: 'storage', label: 'Storage Usage', value: primary.storage_utilization, unit: '%', trend: 'flat' as const, delta: 0, color: COLORS.storage, spark: metrics.map((m) => m.storage_utilization) },
      { id: 'capacity', label: 'Capacity', value: primary.current_capacity, unit: 'nodes', trend: 'flat' as const, delta: 0, color: COLORS.capacity, spark: [] },
      { id: 'cost', label: 'Est. Cost', value: primary.estimated_cost, unit: '$/mo', trend: 'flat' as const, delta: 0, color: COLORS.cost, spark: [] },
    ];
  }, [primary, metrics]);

  const liveChart = useMemo(() => {
    const labels = metrics.map((m) => formatTime(m.timestamp));
    return {
      labels,
      datasets: [
        { label: 'CPU %', data: metrics.map((m) => m.cpu_utilization), borderColor: COLORS.cpu, backgroundColor: 'rgba(239,68,68,0.12)', fill: true, tension: 0.4, borderWidth: 2, pointRadius: 0 },
        { label: 'Memory %', data: metrics.map((m) => m.memory_utilization), borderColor: COLORS.memory, backgroundColor: 'rgba(6,182,212,0.12)', fill: true, tension: 0.4, borderWidth: 2, pointRadius: 0 },
        { label: 'Network %', data: metrics.map((m) => m.network_utilization), borderColor: COLORS.network, backgroundColor: 'rgba(59,130,246,0.1)', fill: true, tension: 0.4, borderWidth: 2, pointRadius: 0 },
      ],
    };
  }, [metrics]);

  const totalCost = useMemo(() => resources.reduce((sum, r) => sum + r.estimated_cost, 0), [resources]);
  const totalCapacity = useMemo(() => resources.reduce((sum, r) => sum + r.current_capacity, 0), [resources]);

  if (loading) {
    return (
      <div>
        <PageHeader title="System Dashboard" subtitle="Real-Time AI-Powered Cloud Resource Management" icon={<Activity size={24} />} action={<StatusBadge variant="primary" pulse>Loading</StatusBadge>} />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} delay={i * 50} />)}
        </div>
        <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-3">
          <div className="xl:col-span-2"><Skeleton className="h-72 w-full" /></div>
          <div className="space-y-4"><Skeleton className="h-40 w-full" /><Skeleton className="h-40 w-full" /></div>
        </div>
      </div>
    );
  }

  if (error && resources.length === 0) {
    return (
      <div>
        <PageHeader title="System Dashboard" subtitle="Real-Time AI-Powered Cloud Resource Management" icon={<Activity size={24} />} />
        <GlassCard className="p-8">
          <div className="flex flex-col items-center gap-4 text-center">
            <AlertCircle size={40} className="text-danger" />
            <p className="text-sm text-slate-300">{error}</p>
            <button onClick={loadResources} className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary-soft px-5 py-2.5 text-sm font-semibold text-white shadow-glow transition-shadow hover:shadow-glow-soft">
              <RefreshCw size={16} /> Retry
            </button>
          </div>
        </GlassCard>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="System Dashboard"
        subtitle="Real-Time AI-Powered Cloud Resource Management"
        icon={<Activity size={24} />}
        action={
          <div className="flex items-center gap-2">
            {syncMsg && <StatusBadge variant="success">{syncMsg}</StatusBadge>}
            <button
              onClick={handleSync}
              disabled={syncing}
              className="flex items-center gap-2 rounded-xl border border-slate-700 bg-bg-card/60 px-4 py-2 text-sm font-semibold text-slate-200 hover:border-primary/40 hover:text-white transition-colors disabled:opacity-60"
            >
              <RefreshCw size={16} className={syncing ? 'animate-spin' : ''} />
              {syncing ? 'Syncing…' : 'Sync from Cloud'}
            </button>
          </div>
        }
      />

      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {/* Metric cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        {metricCards.map((m, i) => (
          <MetricCard key={m.id} {...m} delay={i * 0.05} />
        ))}
      </div>

      {/* Live chart + side cards */}
      <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <ChartCard
          title="Live Metrics"
          subtitle={primary ? `${primary.name} — historical utilization` : 'Historical utilization'}
          icon={<TrendingUp size={18} />}
          className="xl:col-span-2"
          delay={0.1}
        >
          <div className="h-72">
            {metrics.length > 0 ? <Line data={liveChart} options={baseChartOptions} /> : <p className="text-sm text-slate-400">No historical metrics available yet. Run a sync to populate.</p>}
          </div>
        </ChartCard>

        <div className="space-y-4">
          <GlassCard className="p-5" delay={0.15}>
            <SectionTitle title="Resource Summary" icon={<GitBranch size={18} className="text-primary-soft" />} />
            {resources.length === 0 ? (
              <p className="text-sm text-slate-400">No resources found. Click "Sync from Cloud".</p>
            ) : (
              <div className="space-y-2">
                {resources.slice(0, 4).map((r) => (
                  <div key={r.id} className="flex items-center justify-between rounded-xl bg-bg-base/50 px-3 py-2">
                    <div>
                      <p className="text-xs font-semibold text-slate-200">{r.name}</p>
                      <p className="text-[11px] text-slate-500">{r.region} · {r.provider_type}</p>
                    </div>
                    <StatusBadge variant={r.cpu_utilization > 80 ? 'danger' : r.cpu_utilization > 60 ? 'warning' : 'success'}>
                      CPU {Math.round(r.cpu_utilization)}%
                    </StatusBadge>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>

          <GlassCard className="p-5" delay={0.2}>
            <SectionTitle title="Cost Summary" icon={<DollarSign size={18} className="text-success" />} />
            <div className="flex items-baseline gap-1">
              <span className="text-sm text-slate-400">$</span>
              <AnimatedCounter value={totalCost} className="text-2xl font-bold text-slate-50" />
              <span className="text-xs text-slate-500">/mo</span>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <StatusBadge variant="success">{resources.length} resources</StatusBadge>
              <span className="text-xs text-slate-500">{totalCapacity} total capacity</span>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Resource utilization */}
      <div className="mt-6">
        <GlassCard className="p-5" delay={0.3}>
          <SectionTitle title="Resource Utilization" subtitle="Live cluster breakdown" icon={<Cpu size={18} className="text-metric-cpu" />} />
          <div className="space-y-3">
            {metricCards.slice(0, 4).map((m, i) => (
              <div key={m.id}>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300">{m.label}</span>
                  <span className="font-semibold tabular-nums" style={{ color: m.color }}>
                    {m.value}
                    {m.unit}
                  </span>
                </div>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-bg-base">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(m.value, 100)}%` }}
                    transition={{ duration: 1, delay: 0.4 + i * 0.1, ease: 'easeOut' }}
                    className="h-full rounded-full"
                    style={{ background: `linear-gradient(90deg, ${m.color}99, ${m.color})` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
