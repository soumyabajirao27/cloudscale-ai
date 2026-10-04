import { ChartCard } from '@/components/ChartCard';
import { baseChartOptions, Doughnut, Line } from '@/components/Charts';
import { CostCard } from '@/components/CostCard';
import { GlassCard } from '@/components/GlassCard';
import { PageHeader } from '@/components/PageHeader';
import { SectionTitle } from '@/components/SectionTitle';
import { Skeleton } from '@/components/Skeleton';
import { StatusBadge } from '@/components/StatusBadge';
import { getResources, type Resource } from '@/services/resources';
import { DollarSign, PieChart, Scissors, TrendingDown } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

const CATEGORY_COLORS = ['#6366F1', '#06B6D4', '#A855F7', '#3B82F6', '#10B981', '#EC4899'];
const PALETTE = ['#6366F1', '#06B6D4', '#A855F7', '#3B82F6'];

export function CostPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadResources = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getResources();
      setResources(data);
    } catch (err) {
      setError((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to load resources.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadResources();
  }, [loadResources]);

  const totalCost = useMemo(() => resources.reduce((sum, r) => sum + r.estimated_cost, 0), [resources]);
  const totalCapacity = useMemo(() => resources.reduce((sum, r) => sum + r.current_capacity, 0), [resources]);
  const providerTypes = useMemo(() => [...new Set(resources.map((r) => r.provider_type))], [resources]);

  // Breakdown by provider type (derived from live resources).
  const breakdownChart = useMemo(() => {
    const byType = resources.reduce<Record<string, number>>((acc, r) => {
      acc[r.provider_type] = (acc[r.provider_type] ?? 0) + r.estimated_cost;
      return acc;
    }, {});
    const labels = Object.keys(byType);
    return {
      labels,
      datasets: [{ data: labels.map((l) => byType[l]), backgroundColor: labels.map((_, i) => PALETTE[i % PALETTE.length]), borderColor: '#0F172A', borderWidth: 2 }],
    };
  }, [resources]);

  // Per-resource cost over time (single point each, labeled by resource name).
  const costChart = useMemo(() => {
    const labels = resources.map((r) => r.name);
    return {
      labels,
      datasets: [{ label: 'Estimated Monthly Cost', data: resources.map((r) => r.estimated_cost), borderColor: '#10B981', backgroundColor: 'rgba(16,185,129,0.12)', fill: true, tension: 0.4, pointRadius: 3, borderWidth: 2 }],
    };
  }, [resources]);

  if (loading) {
    return (
      <div>
        <PageHeader title="Cost Optimization" subtitle="AI-driven cloud spend reduction & right-sizing" icon={<DollarSign size={24} />} action={<StatusBadge variant="primary" pulse>Loading</StatusBadge>} />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32 w-full" />)}
        </div>
        <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-3">
          <div className="xl:col-span-2"><Skeleton className="h-72 w-full" /></div>
          <Skeleton className="h-72 w-full" />
        </div>
      </div>
    );
  }

  if (error && resources.length === 0) {
    return (
      <div>
        <PageHeader title="Cost Optimization" subtitle="AI-driven cloud spend reduction & right-sizing" icon={<DollarSign size={24} />} />
        <GlassCard className="p-8">
          <div className="flex flex-col items-center gap-4 text-center">
            <p className="text-sm text-slate-300">{error}</p>
            <button onClick={loadResources} className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary-soft px-5 py-2.5 text-sm font-semibold text-white shadow-glow transition-shadow hover:shadow-glow-soft">
              Retry
            </button>
          </div>
        </GlassCard>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Cost Optimization" subtitle="AI-driven cloud spend reduction & right-sizing" icon={<DollarSign size={24} />} action={!error && resources.length > 0 ? <StatusBadge variant="success">{resources.length} resources</StatusBadge> : undefined} />

      {error && (
        <div className="mb-4 flex items-center justify-between gap-2 rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
          <span>{error}</span>
          <button onClick={loadResources} className="rounded-lg border border-danger/40 px-3 py-1.5 text-xs font-semibold hover:bg-danger/10 transition-colors">Retry</button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <CostCard label="Total Monthly Cost" value={totalCost} hint={`${resources.length} resources`} color="#10B981" />
        <CostCard label="Total Capacity" value={totalCapacity} hint="Sum of current_capacity" color="#6366F1" prefix="" delay={0.05} />
        <CostCard label="Avg Cost / Resource" value={resources.length > 0 ? totalCost / resources.length : 0} hint="Estimated monthly cost per resource" color="#F59E0B" delay={0.1} />
        <CostCard label="Provider Types" value={providerTypes.length} hint={providerTypes.join(', ') || 'N/A'} color="#EF4444" prefix="" delay={0.15} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <ChartCard title="Cost by Resource" subtitle="Estimated monthly cost per resource" icon={<TrendingDown size={18} />} className="xl:col-span-2" delay={0.2}>
          <div className="h-72">
            {resources.length > 0 ? <Line data={costChart} options={baseChartOptions} /> : <p className="text-sm text-slate-400">No resources available.</p>}
          </div>
        </ChartCard>

        <ChartCard title="Spend by Provider" subtitle="Cost share by provider type" icon={<PieChart size={18} />} delay={0.25}>
          <div className="h-72">
            {resources.length > 0 ? <Doughnut data={breakdownChart} options={{ ...baseChartOptions, scales: {} }} /> : <p className="text-sm text-slate-400">No resources available.</p>}
          </div>
        </ChartCard>
      </div>

      <div className="mt-6">
        <GlassCard className="p-5" delay={0.3}>
          <SectionTitle title="Resource Cost Breakdown" subtitle="All resources with live estimated cost" icon={<Scissors size={18} className="text-primary-soft" />} />
          {resources.length === 0 ? (
            <p className="text-sm text-slate-400">No resources found. Sync from the Dashboard to populate.</p>
          ) : (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              {resources.map((r, i) => (
                <div key={r.id} className="rounded-xl bg-bg-base/50 p-4">
                  <p className="font-mono text-xs text-slate-400">{r.name}</p>
                  <p className="mt-2 text-sm font-semibold text-slate-100">{r.provider_type} · {r.region}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-xs text-slate-500">Capacity</span>
                    <span className="text-xs font-semibold text-primary-soft">{r.current_capacity}</span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-bg-base">
                    <div className="h-full rounded-full" style={{ background: CATEGORY_COLORS[i % CATEGORY_COLORS.length], width: `${Math.min(r.current_capacity * 10, 100)}%` }} />
                  </div>
                  <p className="mt-3 text-sm font-bold text-success">${r.estimated_cost.toFixed(2)}/mo</p>
                </div>
              ))}
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
}
