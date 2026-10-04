import { useCallback, useEffect, useMemo, useState } from 'react';
import { GitBranch, History, RefreshCw, AlertCircle, Play } from 'lucide-react';
import { motion } from 'framer-motion';
import { PageHeader } from '@/components/PageHeader';
import { GlassCard } from '@/components/GlassCard';
import { ChartCard } from '@/components/ChartCard';
import { SectionTitle } from '@/components/SectionTitle';
import { RecommendationCard } from '@/components/RecommendationCard';
import { StatusBadge } from '@/components/StatusBadge';
import { AnimatedCounter } from '@/components/AnimatedCounter';
import { Skeleton } from '@/components/Skeleton';
import { getResources, type Resource } from '@/services/resources';
import { analyzeResource, type OptimizationAnalysis } from '@/services/predictions';

type Urgency = 'critical' | 'high' | 'medium' | 'low';
type Action = 'scale-up' | 'scale-down' | 'hold';

function mapAction(status: string, suggested: string): Action {
  const s = suggested.toLowerCase();
  if (s.includes('scale up') || s.includes('add')) return 'scale-up';
  if (s.includes('scale down') || s.includes('remov') || s.includes('downsize') || s.includes('reduce')) return 'scale-down';
  if (status === 'OVERLOADED') return 'scale-up';
  if (status === 'UNDERUTILIZED') return 'scale-down';
  return 'hold';
}

function mapUrgency(status: string): Urgency {
  if (status === 'OVERLOADED') return 'critical';
  if (status === 'UNDERUTILIZED') return 'high';
  return 'medium';
}

export function ScalingPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [analysis, setAnalysis] = useState<OptimizationAnalysis | null>(null);
  const [loadingResources, setLoadingResources] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadResources = useCallback(async () => {
    setLoadingResources(true);
    setError(null);
    try {
      const data = await getResources();
      setResources(data);
      if (data.length > 0) {
        setSelectedId((prev) => (prev && data.some((r) => r.id === prev) ? prev : data[0].id));
      }
    } catch (err) {
      setError((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to load resources.');
    } finally {
      setLoadingResources(false);
    }
  }, []);

  useEffect(() => {
    loadResources();
  }, [loadResources]);

  const runAnalysis = useCallback(async (resourceId: number) => {
    setAnalyzing(true);
    setError(null);
    try {
      const result = await analyzeResource(resourceId);
      setAnalysis(result);
    } catch (err) {
      setError((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Analysis failed.');
    } finally {
      setAnalyzing(false);
    }
  }, []);

  useEffect(() => {
    if (selectedId !== null && !analyzing) {
      runAnalysis(selectedId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  const derivedRec = useMemo(() => {
    if (!analysis) return null;
    const action = mapAction(analysis.status, analysis.suggested_action);
    return {
      id: String(analysis.resource_id),
      resource: analysis.resource_name,
      action,
      urgency: mapUrgency(analysis.status) as Urgency,
      from: Math.round(analysis.current_utilization.cpu),
      to: analysis.predicted_cpu_utilization !== null ? Math.round(analysis.predicted_cpu_utilization) : Math.round(analysis.current_utilization.cpu),
      reason: analysis.recommendation,
      eta: '1 hr',
    } as { id: string; resource: string; action: Action; urgency: Urgency; from: number; to: number; reason: string; eta: string };
  }, [analysis]);

  if (loadingResources) {
    return (
      <div>
        <PageHeader title="Scaling Recommendations" subtitle="AI-driven scaling decisions with urgency & reasoning" icon={<GitBranch size={24} />} action={<StatusBadge variant="primary" pulse>Loading</StatusBadge>} />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error && resources.length === 0) {
    return (
      <div>
        <PageHeader title="Scaling Recommendations" subtitle="AI-driven scaling decisions with urgency & reasoning" icon={<GitBranch size={24} />} />
        <GlassCard className="p-8">
          <div className="flex flex-col items-center gap-4 text-center">
            <p className="text-sm text-slate-300">{error}</p>
            <button onClick={loadResources} className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary-soft px-5 py-2.5 text-sm font-semibold text-white shadow-glow transition-shadow hover:shadow-glow-soft">
              <RefreshCw size={16} /> Retry
            </button>
          </div>
        </GlassCard>
      </div>
    );
  }

  const selectedResource = resources.find((r) => r.id === selectedId) ?? null;

  return (
    <div>
      <PageHeader
        title="Scaling Recommendations"
        subtitle="AI-driven scaling decisions with urgency & reasoning"
        icon={<GitBranch size={24} />}
        action={
          <div className="flex items-center gap-2">
            {analysis && (
              <StatusBadge variant={analysis.analysis_source === 'ml_prediction' ? 'success' : 'warning'}>
                {analysis.analysis_source === 'ml_prediction' ? 'ML Prediction' : 'Baseline Analysis'}
              </StatusBadge>
            )}
          </div>
        }
      />

      {/* Resource selector */}
      <GlassCard className="p-5" delay={0.05}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-1 flex-col gap-1">
            <label htmlFor="scaling-resource" className="text-xs font-medium uppercase tracking-wider text-slate-400">Resource</label>
            <select
              id="scaling-resource"
              value={selectedId ?? ''}
              onChange={(e) => { setSelectedId(Number(e.target.value)); setAnalysis(null); }}
              disabled={analyzing}
              className="w-full rounded-xl border border-slate-700 bg-bg-base/60 px-4 py-2.5 text-sm text-slate-100 outline-none transition-colors focus:border-primary/60 focus:ring-2 focus:ring-primary/20 disabled:opacity-60 sm:max-w-xs"
            >
              {resources.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>
          <button
            onClick={() => selectedId !== null && runAnalysis(selectedId)}
            disabled={analyzing || selectedId === null}
            className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary-soft px-5 py-2.5 text-sm font-semibold text-white shadow-glow transition-shadow hover:shadow-glow-soft disabled:cursor-not-allowed disabled:opacity-60"
          >
            {analyzing ? <RefreshCw size={16} className="animate-spin" /> : <Play size={16} />}
            {analyzing ? 'Analyzing…' : 'Run Analysis'}
          </button>
        </div>
        {selectedResource && (
          <p className="mt-3 text-xs text-slate-500">{selectedResource.name} · {selectedResource.region} · {selectedResource.provider_type}</p>
        )}
      </GlassCard>

      {error && (
        <div className="mt-4 flex items-center justify-between gap-2 rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
          <div className="flex items-center gap-2"><AlertCircle size={16} /> {error}</div>
          <button onClick={() => selectedId !== null && runAnalysis(selectedId)} className="rounded-lg border border-danger/40 px-3 py-1.5 text-xs font-semibold hover:bg-danger/10 transition-colors">Retry</button>
        </div>
      )}

      {/* Baseline fallback notice */}
      {analysis && analysis.analysis_source === 'baseline' && (
        <div className="mt-4 flex items-start gap-2 rounded-xl border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <span>Baseline analysis: ML prediction was unavailable (insufficient historical data or untrained model). Results use the deterministic rule engine.</span>
        </div>
      )}

      {/* Live recommendations list */}
      <div className="mt-6 grid grid-cols-1 gap-4">
        {analyzing ? (
          <Skeleton className="h-40 w-full" />
        ) : derivedRec ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
            <RecommendationCard rec={derivedRec} delay={0} />
          </motion.div>
        ) : (
          <GlassCard className="p-5"><p className="text-sm text-slate-400">Run a prediction to see scaling recommendations.</p></GlassCard>
        )}
      </div>

      {/* Scale-Up / Scale-Down simulation derived from selected resource capacity */}
      {analysis && (
        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <GlassCard className="p-5" delay={0.2}>
            <SectionTitle title="Scale-Up Simulation" subtitle="Projected node addition" icon={<GitBranch size={18} className="text-success" />} />
            <div className="relative flex h-40 items-end justify-center gap-2 rounded-xl bg-bg-base/40 p-4">
              {Array.from({ length: 4 }).map((_, i) => {
                const n = analysis.current_utilization.cpu + (i + 1) * 5;
                return (
                  <div key={n} className="flex flex-col items-center gap-2">
                    <div
                      className="w-10 rounded-t-md bg-gradient-to-t from-success/40 to-success"
                      style={{ height: `${Math.min(n, 100) * 0.4}px` }}
                    />
                    <span className="text-xs text-slate-400">+{i + 1}</span>
                  </div>
                );
              })}
              <span className="absolute right-4 top-4 text-xs font-semibold text-success">+capacity</span>
            </div>
          </GlassCard>

          <GlassCard className="p-5" delay={0.25}>
            <SectionTitle title="Scale-Down Simulation" subtitle="Projected node removal" icon={<GitBranch size={18} className="text-warning" />} />
            <div className="relative flex h-40 items-end justify-center gap-2 rounded-xl bg-bg-base/40 p-4">
              {Array.from({ length: 4 }).map((_, i) => {
                const n = Math.max(20, analysis.current_utilization.cpu - (i + 1) * 5);
                return (
                  <div key={n} className="flex flex-col items-center gap-2">
                    <div
                      className="w-10 rounded-t-md bg-gradient-to-t from-warning/40 to-warning"
                      style={{ height: `${Math.min(n, 100) * 0.4}px` }}
                    />
                    <span className="text-xs text-slate-400">-{i + 1}</span>
                  </div>
                );
              })}
              <span className="absolute right-4 top-4 text-xs font-semibold text-warning">-capacity</span>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Detailed analysis details (live fields) */}
      {analysis && (
        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
          <ChartCard title="Current Utilization" subtitle="CPU / Memory / Storage / Network" icon={<GitBranch size={18} className="text-primary-soft" />} delay={0.3}>
            <div className="space-y-3">
              {Object.entries(analysis.current_utilization).map(([k, v]) => (
                <div key={k} className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">{k}</span>
                  <span className="text-sm font-semibold text-slate-100">{v}%</span>
                </div>
              ))}
            </div>
          </ChartCard>

          <GlassCard className="p-5" delay={0.35}>
            <SectionTitle title="Prediction Metrics" icon={<GitBranch size={18} className="text-primary-soft" />} />
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-lg bg-bg-base/50 px-3 py-2">
                <span className="text-sm text-slate-400">Predicted CPU</span>
                <span className="text-sm font-semibold text-slate-100">
                  {analysis.predicted_cpu_utilization !== null ? `${analysis.predicted_cpu_utilization.toFixed(1)}%` : 'N/A'}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-bg-base/50 px-3 py-2">
                <span className="text-sm text-slate-400">Confidence</span>
                <span className="text-sm font-semibold text-slate-100">
                  <AnimatedCounter value={analysis.confidence_score} decimals={2} suffix="" />
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-bg-base/50 px-3 py-2">
                <span className="text-sm text-slate-400">Cost Change</span>
                <span className="text-sm font-semibold text-slate-100">{analysis.estimated_impact.cost_change_percentage}%</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-bg-base/50 px-3 py-2">
                <span className="text-sm text-slate-400">Est. Monthly Savings</span>
                <span className="text-sm font-semibold text-success">${analysis.estimated_impact.estimated_monthly_savings.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-bg-base/50 px-3 py-2">
                <span className="text-sm text-slate-400">Performance</span>
                <span className="max-w-[120px] text-right text-sm font-semibold text-slate-100">{analysis.estimated_impact.performance_impact}</span>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-5" delay={0.4}>
            <SectionTitle title="Recommended Action" icon={<GitBranch size={18} className="text-primary-soft" />} />
            <div className="flex items-center gap-2">
              <StatusBadge variant={statusVariant(analysis.status)}>
                {derivedRec ? derivedRec.action.replace('-', ' ') : analysis.status}
              </StatusBadge>
              <span className="text-xs text-slate-500">Urgency: {derivedRec ? derivedRec.urgency : '—'}</span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-slate-300">{analysis.suggested_action}</p>
          </GlassCard>
        </div>
      )}

      {/* Decision history (single live entry from latest analysis) */}
      <div className="mt-6">
        <GlassCard className="p-5" delay={0.5}>
          <SectionTitle title="Decision History" subtitle="Recent scaling actions" icon={<History size={18} className="text-primary-soft" />} />
          {analysis ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-800 text-left text-xs uppercase tracking-wider text-slate-500">
                    <th className="pb-3 pr-4 font-medium">Time</th>
                    <th className="pb-3 pr-4 font-medium">Resource</th>
                    <th className="pb-3 pr-4 font-medium">Action</th>
                    <th className="pb-3 pr-4 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-800/50">
                    <td className="py-3 pr-4 font-mono text-slate-400">{new Date().toLocaleString()}</td>
                    <td className="py-3 pr-4 text-slate-200">{analysis.resource_name}</td>
                    <td className="py-3 pr-4 text-primary-soft">{derivedRec?.action.replace('-', ' ') ?? 'hold'}</td>
                    <td className="py-3">{analysis.status}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-slate-400">No analysis has been run yet.</p>
          )}
        </GlassCard>
      </div>
    </div>
  );
}

function statusVariant(status: string) {
  if (status === 'OVERLOADED') return 'danger' as const;
  if (status === 'UNDERUTILIZED') return 'warning' as const;
  return 'neutral' as const;
}
