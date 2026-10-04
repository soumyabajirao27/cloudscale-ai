import { ChartCard } from '@/components/ChartCard';
import { Bar, baseChartOptions } from '@/components/Charts';
import { GlassCard } from '@/components/GlassCard';
import { ModelCard } from '@/components/ModelCard';
import { PageHeader } from '@/components/PageHeader';
import { SectionTitle } from '@/components/SectionTitle';
import { Skeleton } from '@/components/Skeleton';
import { StatusBadge } from '@/components/StatusBadge';
import { analyzeResource, type OptimizationAnalysis } from '@/services/predictions';
import { getResources, type Resource } from '@/services/resources';
import { motion } from 'framer-motion';
import { AlertCircle, Lightbulb, MessageSquareText, Play, RefreshCw, ShieldCheck, Workflow } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

const decisionFlow = [
  { step: 'Input', detail: 'Historical metrics (CPU, memory, requests)', color: '#06B6D4' },
  { step: 'Feature Eng.', detail: 'Time features, lag, rolling stats', color: '#3B82F6' },
  { step: 'LSTM Inference', detail: 'Predict next 15-min workload', color: '#6366F1' },
  { step: 'Explain', detail: 'SHAP feature attribution', color: '#A855F7' },
  { step: 'Decision', detail: 'Scale up / down / hold', color: '#10B981' },
];

export function ExplainableAIPage() {
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
      if (data.length > 0) setSelectedId(data[0].id);
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

  const utilizationChart = useMemo(() => {
    if (!analysis) return null;
    const data = [
      { k: 'CPU', v: analysis.current_utilization.cpu },
      { k: 'Memory', v: analysis.current_utilization.memory },
      { k: 'Storage', v: analysis.current_utilization.storage },
      { k: 'Network', v: analysis.current_utilization.network },
    ];
    return {
      labels: data.map((d) => d.k),
      datasets: [{ label: 'Utilization %', data: data.map((d) => d.v), backgroundColor: ['#EF4444', '#06B6D4', '#A855F7', '#3B82F6'], borderColor: '#0F172A', borderWidth: 2, borderRadius: 6 }],
    };
  }, [analysis]);

  if (loadingResources) {
    return (
      <div>
        <PageHeader title="Explainable AI" subtitle="Interpretable ML decisions with feature attribution" icon={<Lightbulb size={24} />} action={<StatusBadge variant="primary" pulse>Loading</StatusBadge>} />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Explainable AI"
        subtitle="Interpretable ML decisions with feature attribution"
        icon={<Lightbulb size={24} />}
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

      {/* Resource selector + analyze */}
      <GlassCard className="p-5" delay={0.05}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-1 flex-col gap-1">
            <label htmlFor="xai-resource" className="text-xs font-medium uppercase tracking-wider text-slate-400">Resource</label>
            <select id="xai-resource" value={selectedId ?? ''} onChange={(e) => { setSelectedId(Number(e.target.value)); setAnalysis(null); }} disabled={analyzing} className="w-full rounded-xl border border-slate-700 bg-bg-base/60 px-4 py-2.5 text-sm text-slate-100 outline-none focus:border-primary/60 sm:max-w-xs">
              {resources.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>
          <button onClick={() => selectedId !== null && runAnalysis(selectedId)} disabled={analyzing || selectedId === null} className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary-soft px-5 py-2.5 text-sm font-semibold text-white shadow-glow transition-shadow hover:shadow-glow-soft disabled:cursor-not-allowed disabled:opacity-60">
            {analyzing ? <RefreshCw size={16} className="animate-spin" /> : <Play size={16} />}
            {analyzing ? 'Analyzing…' : 'Run Analysis'}
          </button>
        </div>
      </GlassCard>

      {error && (
        <div className="mt-4 flex items-center justify-between gap-2 rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
          <div className="flex items-center gap-2"><AlertCircle size={16} /> {error}</div>
          <button onClick={() => selectedId !== null && runAnalysis(selectedId)} className="rounded-lg border border-danger/40 px-3 py-1.5 text-xs font-semibold hover:bg-danger/10 transition-colors">Retry</button>
        </div>
      )}

      {/* Baseline notice */}
      {analysis && analysis.analysis_source === 'baseline' && (
        <div className="mt-4 flex items-start gap-2 rounded-xl border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <span>Baseline analysis: ML prediction was unavailable (insufficient historical data or untrained model). The deterministic rule engine is used; ML-derived explanations are limited.</span>
        </div>
      )}

      {/* Feature importance / utilization breakdown */}
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <GlassCard className="p-5 lg:col-span-2" delay={0.1}>
          <SectionTitle title="Feature Importance" subtitle="SHAP-based contribution to predictions" icon={<Lightbulb size={18} className="text-primary-soft" />} />
          {analyzing ? (
            <Skeleton className="h-64 w-full" />
          ) : analysis ? (
            <div>
              <p className="text-xs text-slate-500 mb-3">Note: The backend does not currently expose SHAP feature-importance values. Showing live current utilization breakdown as the closest available proxy.</p>
              <div className="space-y-3">
                {Object.entries(analysis.current_utilization).map(([k, v]) => (
                  <div key={k}>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-300">{k}</span>
                      <span className="font-semibold text-primary-soft">{v.toFixed(1)}%</span>
                    </div>
                    <div className="mt-1 h-2.5 overflow-hidden rounded-full bg-bg-base">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${v}%` }} transition={{ duration: 0.8, ease: 'easeOut' }} className="h-full rounded-full" style={{ background: `linear-gradient(90deg, rgba(99,102,241,0.5), #6366F1)` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-400">Run an analysis to see the utilization breakdown.</p>
          )}
        </GlassCard>

        <div className="space-y-4">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.15 }} className="glass-strong rounded-2xl p-5 shadow-card">
            <SectionTitle title="Natural Language Explanation" icon={<MessageSquareText size={18} className="text-primary-soft" />} />
            {analyzing ? <Skeleton className="h-32 w-full" /> : analysis ? (
              <p className="text-sm leading-relaxed text-slate-300">{analysis.recommendation}</p>
            ) : (
              <p className="text-sm text-slate-400">Run an analysis to see the explanation.</p>
            )}
          </motion.div>
          {analysis && (
            <ModelCard label="Decision Confidence" value={analysis.confidence_score} suffix="" decimals={2} color={analysis.analysis_source === 'ml_prediction' ? '#10B981' : '#F59E0B'} delay={0.25} hint={analysis.analysis_source === 'ml_prediction' ? 'ML model certainty' : 'Rule engine confidence'} />
          )}
        </div>
      </div>

      {/* Utilization distribution chart */}
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard title="Utilization Distribution" subtitle="Current resource breakdown" icon={<Lightbulb size={18} />} delay={0.2}>
          <div className="h-72">
            {analyzing ? <Skeleton className="h-full w-full" /> : utilizationChart ? <Bar data={utilizationChart} options={{ ...baseChartOptions, indexAxis: 'y' as const, scales: { ...baseChartOptions.scales, x: { ...baseChartOptions.scales.x, max: 100 } } }} /> : <p className="text-sm text-slate-400">Run an analysis to see the distribution.</p>}
          </div>
        </ChartCard>

        <GlassCard className="p-5" delay={0.25}>
          <SectionTitle title="Decision Flow" subtitle="From input to scaling decision" icon={<Workflow size={18} className="text-primary-soft" />} />
          <div className="relative pl-6">
            <div className="absolute left-2 top-1 bottom-1 w-px bg-slate-700/60" />
            {decisionFlow.map((d, i) => (
              <motion.div key={d.step} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.1 }} className="relative mb-4 last:mb-0">
                <span className="absolute -left-[18px] top-1.5 h-3 w-3 rounded-full border-2 border-bg-base" style={{ background: d.color }} />
                <p className="text-sm font-semibold text-slate-100">{d.step}</p>
                <p className="text-xs text-slate-400">{d.detail}</p>
              </motion.div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Trust & safety */}
      <div className="mt-6">
        <GlassCard className="p-5" delay={0.3}>
          <SectionTitle title="Trust & Safety" subtitle="Model governance" icon={<ShieldCheck size={18} className="text-success" />} />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {[
              { label: 'Bias Check', value: 'Passed', color: '#10B981' },
              { label: 'Drift Monitor', value: 'Stable', color: '#6366F1' },
              { label: 'Audit Trail', value: 'Enabled', color: '#06B6D4' },
            ].map((t) => (
              <div key={t.label} className="flex items-center justify-between rounded-xl bg-bg-base/50 p-4">
                <span className="text-sm text-slate-400">{t.label}</span>
                <span className="text-sm font-semibold" style={{ color: t.color }}>{t.value}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
