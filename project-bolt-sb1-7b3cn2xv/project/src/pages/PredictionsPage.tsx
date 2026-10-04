import { ChartCard } from '@/components/ChartCard';
import { baseChartOptions, Line } from '@/components/Charts';
import { GlassCard } from '@/components/GlassCard';
import { ModelCard } from '@/components/ModelCard';
import { PageHeader } from '@/components/PageHeader';
import { SectionTitle } from '@/components/SectionTitle';
import { Skeleton } from '@/components/Skeleton';
import { StatusBadge } from '@/components/StatusBadge';
import { analyzeResource, type OptimizationAnalysis } from '@/services/predictions';
import { getResources, type Resource } from '@/services/resources';
import { AlertCircle, BrainCircuit, Clock, Play, RefreshCw, Sparkles, Target } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

const cardIcons = [Target, Clock, BrainCircuit];

const statusVariant = {
  OPTIMAL: 'success' as const,
  UNDERUTILIZED: 'warning' as const,
  OVERLOADED: 'danger' as const,
};

export function PredictionsPage() {
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
      if (data.length > 0 && selectedId === null) {
        setSelectedId(data[0].id);
      }
    } catch (err) {
      setError((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to load resources.');
    } finally {
      setLoadingResources(false);
    }
  }, [selectedId]);

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

  // Auto-run analysis when a resource is selected (if not already analyzing).
  useEffect(() => {
    if (selectedId !== null && !analyzing) {
      runAnalysis(selectedId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  const selectedResource = resources.find((r) => r.id === selectedId) ?? null;

  const predictionCards = useMemo(() => {
    if (!analysis) return [];
    const isBaseline = analysis.analysis_source === 'baseline';
    return [
      { id: 'confidence', label: 'Confidence', value: `${Math.round(analysis.confidence_score * 100)}%`, hint: isBaseline ? 'Baseline rule engine confidence' : 'Model certainty on forecast' },
      { id: 'predicted', label: 'Predicted CPU', value: analysis.predicted_cpu_utilization !== null ? `${analysis.predicted_cpu_utilization.toFixed(1)}%` : 'N/A', hint: isBaseline ? 'ML prediction unavailable — baseline used' : 'Next-hour CPU forecast' },
      { id: 'status', label: 'Status', value: analysis.status, hint: analysis.recommendation },
    ];
  }, [analysis]);

  const forecastChart = useMemo(() => {
    if (!analysis) return null;
    const predicted = analysis.predicted_cpu_utilization;
    const current = analysis.current_utilization.cpu;
    const labels = ['Current', 'Forecast'];
    const actual = [current, predicted ?? current];
    const upper = [current, predicted !== null ? Math.min(predicted + 5, 100) : current];
    const lower = [current, predicted !== null ? Math.max(predicted - 5, 0) : current];
    return {
      labels,
      datasets: [
        { label: 'Upper Bound', data: upper, borderColor: 'rgba(99,102,241,0.25)', backgroundColor: 'rgba(99,102,241,0.12)', fill: '+1', tension: 0.4, pointRadius: 0, borderWidth: 1, borderDash: [4, 4] },
        { label: 'Lower Bound', data: lower, borderColor: 'rgba(99,102,241,0.25)', backgroundColor: 'transparent', fill: false, tension: 0.4, pointRadius: 0, borderWidth: 1, borderDash: [4, 4] },
        { label: 'Actual', data: actual, borderColor: '#06B6D4', backgroundColor: 'rgba(6,182,212,0.1)', fill: false, tension: 0.4, pointRadius: 3, borderWidth: 2 },
        { label: 'Predicted', data: [null, predicted], borderColor: '#6366F1', backgroundColor: 'rgba(99,102,241,0.15)', fill: false, tension: 0.4, pointRadius: 3, borderWidth: 2.5, borderDash: [6, 3] },
      ],
    };
  }, [analysis]);

  if (loadingResources) {
    return (
      <div>
        <PageHeader title="Predictions" subtitle="ML-driven workload forecasting & confidence intervals" icon={<Sparkles size={24} />} action={<StatusBadge variant="primary" pulse>Loading</StatusBadge>} />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28 w-full" />)}
        </div>
        <div className="mt-6"><Skeleton className="h-80 w-full" /></div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Predictions"
        subtitle="ML-driven workload forecasting & confidence intervals"
        icon={<Sparkles size={24} />}
        action={
          <div className="flex items-center gap-2">
            {analysis && (
              <StatusBadge variant={analysis.analysis_source === 'ml_prediction' ? 'success' : 'warning'} pulse>
                {analysis.analysis_source === 'ml_prediction' ? 'ML Prediction' : 'Baseline Analysis'}
              </StatusBadge>
            )}
          </div>
        }
      />

      {/* Resource selector + analyze */}
      <GlassCard className="p-5" delay={0.05}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 flex-col gap-1">
            <label htmlFor="resource-select" className="text-xs font-medium uppercase tracking-wider text-slate-400">Resource</label>
            <select
              id="resource-select"
              value={selectedId ?? ''}
              onChange={(e) => setSelectedId(Number(e.target.value))}
              disabled={analyzing}
              className="w-full rounded-xl border border-slate-700 bg-bg-base/60 px-4 py-2.5 text-sm text-slate-100 outline-none transition-colors focus:border-primary/60 focus:ring-2 focus:ring-primary/20 disabled:opacity-60 sm:max-w-xs"
            >
              {resources.length === 0 && <option value="">No resources</option>}
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
            {analyzing ? 'Analyzing…' : 'Run Prediction'}
          </button>
        </div>
        {selectedResource && (
          <p className="mt-3 text-xs text-slate-500">
            {selectedResource.name} · {selectedResource.region} · {selectedResource.provider_type}
          </p>
        )}
      </GlassCard>

      {error && (
        <div className="mt-4 flex items-center justify-between gap-2 rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
          <div className="flex items-center gap-2"><AlertCircle size={16} /> {error}</div>
          <button onClick={() => selectedId !== null && runAnalysis(selectedId)} className="flex items-center gap-1 rounded-lg border border-danger/40 px-3 py-1.5 text-xs font-semibold hover:bg-danger/10 transition-colors">
            <RefreshCw size={12} /> Retry
          </button>
        </div>
      )}

      {/* Baseline fallback notice */}
      {analysis && analysis.analysis_source === 'baseline' && (
        <div className="mt-4 flex items-start gap-2 rounded-xl border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <span>Baseline analysis: ML prediction was unavailable (insufficient historical data or untrained model). Results use the deterministic rule engine.</span>
        </div>
      )}

      {/* Prediction cards */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {analyzing ? (
          Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28 w-full" />)
        ) : predictionCards.length > 0 ? (
          predictionCards.map((c, i) => {
            const Icon = cardIcons[i] ?? Target;
            return (
              <GlassCard key={c.id} className="p-5" delay={i * 0.06}>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary-soft">
                    <Icon size={18} />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-slate-400">{c.label}</p>
                    <p className="text-2xl font-bold text-slate-50">{c.value}</p>
                  </div>
                </div>
                <p className="mt-3 text-xs text-slate-500">{c.hint}</p>
              </GlassCard>
            );
          })
        ) : (
          <GlassCard className="p-5 sm:col-span-3">
            <p className="text-sm text-slate-400">Select a resource and run a prediction to see results.</p>
          </GlassCard>
        )}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <ChartCard
          title="Workload Forecast"
          subtitle={analysis ? `${analysis.resource_name} — predicted CPU with confidence band` : 'Actual vs predicted CPU utilization'}
          icon={<Sparkles size={18} />}
          className="xl:col-span-2"
          delay={0.1}
        >
          <div className="h-80">
            {analyzing ? <Skeleton className="h-full w-full" /> : forecastChart ? <Line data={forecastChart} options={baseChartOptions} /> : <p className="text-sm text-slate-400">Run a prediction to see the forecast chart.</p>}
          </div>
        </ChartCard>

        <GlassCard className="p-5" delay={0.15}>
          <SectionTitle title="Analysis Details" icon={<BrainCircuit size={18} className="text-primary-soft" />} />
          {analyzing ? (
            <div className="space-y-3"><Skeleton className="h-8 w-full" /><Skeleton className="h-8 w-full" /><Skeleton className="h-8 w-full" /></div>
          ) : analysis ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-lg bg-bg-base/50 p-3">
                <span className="text-sm text-slate-400">Status</span>
                <StatusBadge variant={statusVariant[analysis.status]}>{analysis.status}</StatusBadge>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-bg-base/50 p-3">
                <span className="text-sm text-slate-400">Suggested Action</span>
                <span className="max-w-[55%] text-right text-sm font-semibold text-slate-100">{analysis.suggested_action}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-bg-base/50 p-3">
                <span className="text-sm text-slate-400">Cost Change</span>
                <span className="text-sm font-semibold text-slate-100">{analysis.estimated_impact.cost_change_percentage}%</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-bg-base/50 p-3">
                <span className="text-sm text-slate-400">Monthly Savings</span>
                <span className="text-sm font-semibold text-success">${analysis.estimated_impact.estimated_monthly_savings.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-bg-base/50 p-3">
                <span className="text-sm text-slate-400">Performance</span>
                <span className="max-w-[55%] text-right text-sm font-semibold text-slate-100">{analysis.estimated_impact.performance_impact}</span>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-400">Run a prediction to see analysis details.</p>
          )}
        </GlassCard>
      </div>

      {/* Current utilization */}
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {analyzing ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)
        ) : analysis ? (
          <>
            <ModelCard label="CPU" value={analysis.current_utilization.cpu} suffix="%" decimals={1} color="#EF4444" delay={0.2} />
            <ModelCard label="Memory" value={analysis.current_utilization.memory} suffix="%" decimals={1} color="#06B6D4" delay={0.25} />
            <ModelCard label="Storage" value={analysis.current_utilization.storage} suffix="%" decimals={1} color="#A855F7" delay={0.3} />
            <ModelCard label="Network" value={analysis.current_utilization.network} suffix="%" decimals={1} color="#3B82F6" delay={0.35} />
          </>
        ) : (
          <GlassCard className="p-5 lg:col-span-4"><p className="text-sm text-slate-400">Run a prediction to see current utilization.</p></GlassCard>
        )}
      </div>

      {/* Recommendation */}
      <div className="mt-6">
        <GlassCard className="p-5" delay={0.4}>
          <SectionTitle title="Recommendation" subtitle="AI-generated guidance" icon={<BrainCircuit size={18} className="text-primary-soft" />} />
          {analyzing ? (
            <Skeleton className="h-16 w-full" />
          ) : analysis ? (
            <p className="text-sm leading-relaxed text-slate-300">{analysis.recommendation}</p>
          ) : (
            <p className="text-sm text-slate-400">Run a prediction to see the recommendation.</p>
          )}
        </GlassCard>
      </div>
    </div>
  );
}
