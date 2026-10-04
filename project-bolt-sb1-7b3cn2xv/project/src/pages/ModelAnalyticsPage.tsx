import { ChartCard } from '@/components/ChartCard';
import { GlassCard } from '@/components/GlassCard';
import { ModelCard } from '@/components/ModelCard';
import { PageHeader } from '@/components/PageHeader';
import { SectionTitle } from '@/components/SectionTitle';
import { Skeleton } from '@/components/Skeleton';
import { StatusBadge } from '@/components/StatusBadge';
import { trainModel, type TrainingResult } from '@/services/models';
import { motion } from 'framer-motion';
import { AlertCircle, BrainCircuit, Cpu, GitBranch, Layers, LineChart, RefreshCw } from 'lucide-react';
import { useCallback, useState } from 'react';

function errorMessage(status: number | undefined, fallback: string): string {
  switch (status) {
    case 400:
      return 'The request was malformed. Please try again.';
    case 401:
      return 'Authentication required. Please log in again.';
    case 403:
      return 'You do not have permission to train the model.';
    case 404:
      return 'Training endpoint not found.';
    case 422:
      return 'The request could not be processed.';
    case 500:
      return 'An internal server error occurred while training.';
    default:
      return fallback;
  }
}

const lstmConceptualLayers = ['RandomForest', 'Scikit', 'Ensemble', 'Regressor'];

export function ModelAnalyticsPage() {
  const [result, setResult] = useState<TrainingResult | null>(null);
  const [training, setTraining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTrain = useCallback(async () => {
    if (training) return; // prevent duplicate requests
    setTraining(true);
    setError(null);
    try {
      const data = await trainModel();
      setResult(data);
    } catch (err) {
      const status = (err as { response?: { status?: number; data?: { message?: string } } })?.response?.status;
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      if (status === 403) {
        setError('You do not have permission to train the model.');
      } else {
        setError(msg ?? errorMessage(status, 'Failed to train the model. The backend may be unavailable.'));
      }
      // Preserve any previous result on failure — do NOT clear it.
    } finally {
      setTraining(false);
    }
  }, [training]);

  return (
    <div>
      <PageHeader
        title="Model Analytics"
        subtitle="RandomForestRegressor training, performance metrics & status"
        icon={<BrainCircuit size={24} />}
        action={
          <button
            onClick={handleTrain}
            disabled={training}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary-soft px-4 py-2 text-sm font-semibold text-white shadow-glow transition-shadow hover:shadow-glow-soft disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw size={16} className={training ? 'animate-spin' : ''} />
            {training ? 'Training…' : 'Train Model'}
          </button>
        }
      />

      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {/* Performance metric cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {training && !result ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32 w-full" />)
        ) : result ? (
          <>
            <ModelCard label="Samples Used" value={result.samples_used} decimals={0} color="#10B981" hint="Numeric observations used" />
            <ModelCard label="MAE" value={result.mae ?? 0} decimals={4} color="#F59E0B" hint="Mean Absolute Error" />
            <ModelCard label="RMSE" value={result.rmse ?? 0} decimals={4} color="#EF4444" hint="Root Mean Square Error" />
            <ModelCard label="R² Score" value={result.r2 ?? 0} decimals={4} color="#6366F1" hint="Goodness of fit" />
          </>
        ) : (
          <GlassCard className="col-span-2 p-6 lg:col-span-4 lg:flex lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-200">No training result available yet.</p>
              <p className="mt-1 text-sm text-slate-400">Train the model to generate a new result.</p>
            </div>
            <button
              onClick={handleTrain}
              disabled={training}
              className="mt-4 flex items-center gap-2 rounded-xl border border-slate-700 bg-bg-card/60 px-4 py-2 text-sm font-semibold text-slate-200 hover:border-primary/40 hover:text-white transition-colors disabled:opacity-60 lg:mt-0"
            >
              <RefreshCw size={16} className={training ? 'animate-spin' : ''} />
              {training ? 'Training…' : 'Train Now'}
            </button>
          </GlassCard>
        )}
      </div>

      {/* Training result status */}
      <div className="mt-6">
        <ChartCard
          title="Training Result"
          subtitle={result ? `Model ${result.model_version ?? '—'}` : 'Latest training outcome'}
          icon={<GitBranch size={18} />}
          action={result ? <StatusBadge variant={result.status === 'success' ? 'success' : 'warning'}>{result.status}</StatusBadge> : undefined}
          delay={0.1}
        >
          {training ? (
            <div className="py-10 text-center">
              <RefreshCw size={28} className="mx-auto animate-spin text-primary-soft" />
              <p className="mt-3 text-sm text-slate-400">Training the RandomForestRegressor model…</p>
            </div>
          ) : result ? (
            <div className="space-y-3">
              <p className="text-sm text-slate-300">{result.message}</p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="rounded-lg bg-bg-base/50 p-3"><span className="text-xs text-slate-500">Status</span><p className="mt-0.5 text-sm font-semibold text-slate-100">{result.status}</p></div>
                <div className="rounded-lg bg-bg-base/50 p-3"><span className="text-xs text-slate-500">Samples</span><p className="mt-0.5 text-sm font-semibold text-slate-100">{result.samples_used}</p></div>
                <div className="rounded-lg bg-bg-base/50 p-3"><span className="text-xs text-slate-500">Model Version</span><p className="mt-0.5 text-sm font-semibold text-slate-100">{result.model_version ?? '—'}</p></div>
              </div>
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-slate-400">No training result available yet. Use the "Train Model" button above.</p>
          )}
        </ChartCard>
      </div>

      {/* Training progress / model metrics — no loss curves exposed by backend */}
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ChartCard
          title="Training Progress"
          subtitle="Conceptual illustration — loss curves not exposed by backend"
          icon={<LineChart size={18} />}
          className="lg:col-span-2"
          delay={0.2}
        >
          <div className="h-56">
            <div className="flex h-full flex-col items-center justify-center rounded-xl border border-dashed border-slate-700 bg-bg-base/40 p-6 text-center">
              <AlertCircle size={28} className="text-slate-600" />
              <p className="mt-3 text-sm text-slate-400">The backend does not expose per-epoch loss curves.</p>
              <p className="mt-1 text-xs text-slate-500">Recent training quality is reported via MAE, RMSE and R² metrics above.</p>
            </div>
          </div>
        </ChartCard>

        <GlassCard className="p-5" delay={0.25}>
          <SectionTitle title="Model Capacity" icon={<Cpu size={18} className="text-primary-soft" />} />
          {result ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-lg bg-bg-base/50 p-3">
                <span className="text-sm text-slate-400">Algorithm</span>
                <span className="text-sm font-semibold text-slate-100">RandomForestRegressor</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-bg-base/50 p-3">
                <span className="text-sm text-slate-400">Samples</span>
                <span className="text-sm font-semibold text-slate-100">{result.samples_used}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-bg-base/50 p-3">
                <span className="text-sm text-slate-400">Version</span>
                <span className="text-sm font-semibold text-slate-100">{result.model_version ?? '—'}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-bg-base/50 p-3">
                <span className="text-sm text-slate-400">Status</span>
                <StatusBadge variant={result.status === 'success' ? 'success' : 'warning'}>{result.status}</StatusBadge>
              </div>
            </div>
          ) : (
            <p className="py-6 text-center text-sm text-slate-400">Train the model to see live model details.</p>
          )}
        </GlassCard>
      </div>

      {/* Algorithm architecture */}
      <div className="mt-6">
        <GlassCard className="p-5" delay={0.3}>
          <SectionTitle title="Algorithm Architecture" subtitle="Illustrative pipeline — see backend deployment for exact internals" icon={<Layers size={18} className="text-primary-soft" />} />
          <div className="flex flex-wrap items-center justify-center gap-3 py-6">
            {lstmConceptualLayers.map((layer, i) => (
              <div key={layer} className="flex items-center gap-3">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                  className="flex h-16 w-24 flex-col items-center justify-center rounded-xl border border-primary/40 bg-primary/15 text-primary-soft shadow-glow-soft"
                >
                  <span className="text-xs font-semibold">{layer}</span>
                </motion.div>
                {i < lstmConceptualLayers.length - 1 && <span className="text-slate-600">→</span>}
              </div>
            ))}
          </div>
          <p className="mx-auto max-w-lg text-center text-xs text-slate-500">
            This diagram illustrates the conceptual RandomForestRegressor ensemble pipeline. Hyperparameter values are not surfaced by the backend API and are intentionally not displayed.
          </p>
        </GlassCard>
      </div>
    </div>
  );
}
