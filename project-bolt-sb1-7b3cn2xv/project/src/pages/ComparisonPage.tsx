import { ChartCard } from '@/components/ChartCard';
import { baseChartOptions, Radar } from '@/components/Charts';
import { ComparisonCard } from '@/components/ComparisonCard';
import { GlassCard } from '@/components/GlassCard';
import { PageHeader } from '@/components/PageHeader';
import { Skeleton } from '@/components/Skeleton';
import { getResources, type Resource } from '@/services/resources';
import { motion } from 'framer-motion';
import { AlertCircle, BarChart3, Columns2, Cpu, RefreshCw } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

export function ComparisonPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadResources = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getResources();
      setResources(data);
      if (data.length > 0) setSelectedId(data[0].id);
    } catch (err) {
      setError((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to load resources.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadResources();
  }, [loadResources]);

  const selected = resources.find((r) => r.id === selectedId) ?? null;

  const comparisonMetrics = useMemo(() => {
    if (resources.length === 0) return [];
    const totalCost = resources.reduce((s, r) => s + r.estimated_cost, 0);
    const avgCpu = resources.reduce((s, r) => s + r.cpu_utilization, 0) / resources.length;
    const maxMem = Math.max(...resources.map((r) => r.memory_utilization));
    const totalCapacity = resources.reduce((s, r) => s + r.current_capacity, 0);
    const overThreshold = resources.filter((r) => r.cpu_utilization > 75).length;
    return [
      { metric: 'Total Monthly Cost', traditional: `$${totalCost.toFixed(0)}`, ml: `${totalCost.toFixed(0)}`, improvement: `${resources.length} resources` },
      { metric: 'Avg CPU Utilization', traditional: `${avgCpu.toFixed(1)}%`, ml: `${avgCpu.toFixed(1)}%`, improvement: `${overThreshold} above 75%` },
      { metric: 'Max Memory Utilization', traditional: `${maxMem.toFixed(1)}%`, ml: `${maxMem.toFixed(1)}%`, improvement: 'peak load' },
      { metric: 'Total Capacity', traditional: `${totalCapacity}`, ml: `${totalCapacity}`, improvement: `${resources.length} instances` },
    ];
  }, [resources]);

  const radarChart = useMemo(() => {
    if (!selected) {
      return { labels: ['CPU', 'Memory', 'Storage', 'Network'], datasets: [{ label: 'Utilization', data: [0, 0, 0, 0], backgroundColor: 'rgba(99,102,241,0.15)', borderColor: '#6366F1', pointBackgroundColor: '#6366F1', borderWidth: 2 }] };
    }
    return {
      labels: ['CPU', 'Memory', 'Storage', 'Network'],
      datasets: [
        { label: selected.name, data: [selected.cpu_utilization, selected.memory_utilization, selected.storage_utilization, selected.network_utilization], backgroundColor: 'rgba(99,102,241,0.15)', borderColor: '#6366F1', pointBackgroundColor: '#6366F1', borderWidth: 2 },
      ],
    };
  }, [selected]);

  return (
    <div>
      <PageHeader
        title="Traditional vs ML-Based"
        subtitle="Side-by-side comparison of cloud management approaches"
        icon={<Columns2 size={24} />}
        action={
          <select
            value={selectedId ?? ''}
            onChange={(e) => setSelectedId(Number(e.target.value))}
            className="rounded-xl border border-slate-700 bg-bg-base/60 px-3 py-1.5 text-sm text-slate-100 outline-none focus:border-primary/60 sm:max-w-xs"
          >
            {resources.map((r) => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
        }
      />

      {error && (
        <div className="mb-4 flex items-center justify-between gap-2 rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
          <div className="flex items-center gap-2"><AlertCircle size={16} /> {error}</div>
          <button onClick={loadResources} className="rounded-lg border border-danger/40 px-3 py-1.5 text-xs font-semibold hover:bg-danger/10 transition-colors">Retry</button>
        </div>
      )}

      {/* Split screen hero (conceptual, preserved) */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} className="glass-strong relative overflow-hidden rounded-2xl border border-danger/20 p-6 shadow-card">
          <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-danger/10 blur-3xl" />
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-danger/15 text-danger"><Cpu size={24} /></div>
            <div><h2 className="text-xl font-bold text-slate-100">Traditional</h2><p className="text-sm text-slate-400">Reactive, static provisioning</p></div>
          </div>
          <div className="mt-5 space-y-2">
            {['Manual threshold rules', 'Fixed instance counts', 'Slow reaction to spikes', 'High over-provisioning'].map((t) => (
              <p key={t} className="flex items-center gap-2 text-sm text-slate-300"><span className="h-1.5 w-1.5 rounded-full bg-danger" />{t}</p>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="glass-strong relative overflow-hidden rounded-2xl border border-primary/30 p-6 shadow-glow-soft">
          <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary/15 blur-3xl" />
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-primary-soft"><BarChart3 size={24} /></div>
            <div><h2 className="text-xl font-bold text-slate-100">ML-Based</h2><p className="text-sm text-slate-400">Predictive, adaptive auto-scaling</p></div>
          </div>
          <div className="mt-5 space-y-2">
            {['LSTM workload forecasting', 'Dynamic instance scaling', 'Proactive spike prevention', 'Cost-optimized right-sizing'].map((t) => (
              <p key={t} className="flex items-center gap-2 text-sm text-slate-300"><span className="h-1.5 w-1.5 rounded-full bg-success" />{t}</p>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Improvement cards (live) */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 w-full" />)
          : comparisonMetrics.map((m, i) => (
              <ComparisonCard key={m.metric} {...m} delay={i * 0.06} />
            ))}
      </div>

      {/* Radar chart (live) */}
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard title="Resource Utilization Radar" subtitle={selected ? `${selected.name} — live utilization` : 'Multi-dimensional utilization'} icon={<Columns2 size={18} />} delay={0.2}>
          <div className="h-80">
            {loading ? <Skeleton className="h-full w-full" /> : <Radar data={radarChart} options={baseChartOptions} />}
          </div>
        </ChartCard>

        <GlassCard className="p-5" delay={0.25}>
          <h3 className="font-semibold text-slate-100">Summary</h3>
          <p className="mt-2 text-sm text-slate-400">
            {resources.length > 0
              ? `Live cluster total: ${resources.reduce((s, r) => s + r.estimated_cost, 0).toFixed(2)}/mo across ${resources.length} resources across ${[...new Set(resources.map((r) => r.provider_type))].join(', ')}.`
              : 'No resources available. Sync from the Dashboard to populate.'}
          </p>
          <RefreshCw size={16} className="mt-3 text-slate-500" />
          <button onClick={loadResources} className="mt-2 text-xs font-semibold text-primary-soft hover:underline">Refresh comparison</button>
        </GlassCard>
      </div>
    </div>
  );
}
