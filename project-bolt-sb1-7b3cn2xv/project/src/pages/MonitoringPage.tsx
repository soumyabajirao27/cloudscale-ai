import { ChartCard } from '@/components/ChartCard';
import { baseChartOptions, Line } from '@/components/Charts';
import { GlassCard } from '@/components/GlassCard';
import { PageHeader } from '@/components/PageHeader';
import { SectionTitle } from '@/components/SectionTitle';
import { Skeleton } from '@/components/Skeleton';
import {
  createResourceMetric,
  getResourceMetrics,
  getResources,
  type Resource,
  type ResourceMetric,
  type ResourceMetricCreate,
} from '@/services/resources';
import { motion } from 'framer-motion';
import { Activity, AlertCircle, BarChart3, Cpu, HardDrive, Network, Plus, RefreshCw, Save, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

function fmtTime(ts: string): string {
  try {
    return new Date(ts).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  } catch {
    return ts;
  }
}

export function MonitoringPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [metrics, setMetrics] = useState<ResourceMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [metricsLoading, setMetricsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [metricsError, setMetricsError] = useState<string | null>(null);

  // Form states
  const [formOpen, setFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [cpuVal, setCpuVal] = useState('50');
  const [memVal, setMemVal] = useState('50');
  const [storageVal, setStorageVal] = useState('0');
  const [networkVal, setNetworkVal] = useState('0');
  const [timestampVal, setTimestampVal] = useState('');

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const loadResources = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getResources();
      setResources(data);
      if (data.length > 0) setSelectedId(data[0].id);
    } catch (err) {
      setError((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to load resources.');
      setResources([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMetrics = useCallback(async (id: number) => {
    setMetrics([]); // Clear stale metrics immediately before loading new ones!
    setMetricsLoading(true);
    setMetricsError(null);
    try {
      const data = await getResourceMetrics(id);
      setMetrics(data);
    } catch (err) {
      setMetricsError((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to load metrics.');
      setMetrics([]);
    } finally {
      setMetricsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadResources();
  }, [loadResources]);

  useEffect(() => {
    if (selectedId !== null) {
      loadMetrics(selectedId);
    } else {
      setMetrics([]);
    }
  }, [selectedId, loadMetrics]);

  const selected = resources.find((r) => r.id === selectedId) ?? null;

  const cpuChart = useMemo(() => ({
    labels: metrics.map((m) => fmtTime(m.timestamp)),
    datasets: [{ label: 'CPU %', data: metrics.map((m) => m.cpu_utilization), borderColor: '#EF4444', backgroundColor: 'rgba(239,68,68,0.12)', fill: true, tension: 0.4, pointRadius: 0, borderWidth: 2 }],
  }), [metrics]);

  const memChart = useMemo(() => ({
    labels: metrics.map((m) => fmtTime(m.timestamp)),
    datasets: [{ label: 'Memory %', data: metrics.map((m) => m.memory_utilization), borderColor: '#06B6D4', backgroundColor: 'rgba(6,182,212,0.12)', fill: true, tension: 0.4, pointRadius: 0, borderWidth: 2 }],
  }), [metrics]);

  const netChart = useMemo(() => ({
    labels: metrics.map((m) => fmtTime(m.timestamp)),
    datasets: [{ label: 'Network %', data: metrics.map((m) => m.network_utilization), borderColor: '#3B82F6', backgroundColor: 'rgba(59,130,246,0.12)', fill: true, tension: 0.4, pointRadius: 0, borderWidth: 2 }],
  }), [metrics]);

  const avg = (key: 'cpu_utilization' | 'memory_utilization' | 'storage_utilization' | 'network_utilization') => {
    if (!selected) return 0;
    return selected[key];
  };

  const handleAddMetric = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId) return;

    setFormErrors({});
    setSubmitError(null);
    setSubmitSuccess(null);

    const errors: Record<string, string> = {};
    const cpu = parseFloat(cpuVal);
    const mem = parseFloat(memVal);
    const storage = parseFloat(storageVal || '0');
    const net = parseFloat(networkVal || '0');

    if (isNaN(cpu) || cpu < 0 || cpu > 100) errors.cpu = 'CPU must be between 0 and 100';
    if (isNaN(mem) || mem < 0 || mem > 100) errors.mem = 'Memory must be between 0 and 100';
    if (!isNaN(storage) && (storage < 0 || storage > 100)) errors.storage = 'Storage must be between 0 and 100';
    if (!isNaN(net) && (net < 0 || net > 100)) errors.net = 'Network must be between 0 and 100';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setSaving(true);
    try {
      const payload: ResourceMetricCreate = {
        cpu_utilization: cpu,
        memory_utilization: mem,
        storage_utilization: storage,
        network_utilization: net,
        timestamp: timestampVal ? new Date(timestampVal).toISOString() : null,
      };

      await createResourceMetric(selectedId, payload);
      setSubmitSuccess('Metric observation recorded successfully!');

      // Reset non-utilization fields optionally or just clear success after a while
      setCpuVal('50');
      setMemVal('50');
      setStorageVal('0');
      setNetworkVal('0');
      setTimestampVal('');
      setFormOpen(false);

      // Instantly load fresh metrics
      await loadMetrics(selectedId);
    } catch (err) {
      setSubmitError((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to record metric observation.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="System Monitoring"
        subtitle="Cloud infrastructure overview & real-time health"
        icon={<Activity size={24} />}
        action={
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {resources.length > 0 && (
              <button
                onClick={() => {
                  setFormOpen(!formOpen);
                  setSubmitSuccess(null);
                  setSubmitError(null);
                  setFormErrors({});
                }}
                className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary-soft px-4 py-2 text-sm font-semibold text-white shadow-glow transition-shadow hover:shadow-glow-soft"
              >
                {formOpen ? <X size={16} /> : <Plus size={16} />}
                {formOpen ? 'Close Form' : 'Add Metric'}
              </button>
            )}
            <select
              value={selectedId ?? ''}
              onChange={(e) => setSelectedId(Number(e.target.value))}
              className="rounded-xl border border-slate-700 bg-bg-base/60 px-3 py-1.5 text-sm text-slate-100 outline-none focus:border-primary/60 sm:max-w-xs"
            >
              {resources.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>
        }
      />

      {error && (
        <div className="mb-4 flex items-center justify-between gap-2 rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
          <div className="flex items-center gap-2"><AlertCircle size={16} /> {error}</div>
          <button onClick={loadResources} className="rounded-lg border border-danger/40 px-3 py-1.5 text-xs font-semibold hover:bg-danger/10 transition-colors">Retry</button>
        </div>
      )}

      {/* Manual Metric Observation Form */}
      {formOpen && selected && (
        <GlassCard className="p-5 mb-6" delay={0.05}>
          <div className="flex items-center justify-between">
            <SectionTitle title={`Add Metric to ${selected.name}`} icon={<Plus size={18} className="text-primary-soft" />} />
            <button onClick={() => setFormOpen(false)} className="rounded-lg p-1 text-slate-400 hover:bg-bg-elevated/60 hover:text-slate-200 transition-colors">
              <X size={18} />
            </button>
          </div>
          <form onSubmit={handleAddMetric} className="mt-3 space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className="text-xs font-medium uppercase tracking-wider text-slate-400">CPU Utilization (%) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  min="0"
                  max="100"
                  value={cpuVal}
                  onChange={(e) => setCpuVal(e.target.value)}
                  disabled={saving}
                  className={`mt-1 w-full rounded-xl border bg-bg-base/60 px-3 py-2 text-sm text-slate-100 outline-none transition-colors ${formErrors.cpu ? 'border-danger' : 'border-slate-700 focus:border-primary/60'} disabled:opacity-60`}
                />
                {formErrors.cpu && <p className="mt-1 text-[11px] text-danger">{formErrors.cpu}</p>}
              </div>

              <div>
                <label className="text-xs font-medium uppercase tracking-wider text-slate-400">Memory Utilization (%) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  min="0"
                  max="100"
                  value={memVal}
                  onChange={(e) => setMemVal(e.target.value)}
                  disabled={saving}
                  className={`mt-1 w-full rounded-xl border bg-bg-base/60 px-3 py-2 text-sm text-slate-100 outline-none transition-colors ${formErrors.mem ? 'border-danger' : 'border-slate-700 focus:border-primary/60'} disabled:opacity-60`}
                />
                {formErrors.mem && <p className="mt-1 text-[11px] text-danger">{formErrors.mem}</p>}
              </div>

              <div>
                <label className="text-xs font-medium uppercase tracking-wider text-slate-400">Storage Utilization (%)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={storageVal}
                  onChange={(e) => setStorageVal(e.target.value)}
                  disabled={saving}
                  className={`mt-1 w-full rounded-xl border bg-bg-base/60 px-3 py-2 text-sm text-slate-100 outline-none transition-colors ${formErrors.storage ? 'border-danger' : 'border-slate-700 focus:border-primary/60'} disabled:opacity-60`}
                />
                {formErrors.storage && <p className="mt-1 text-[11px] text-danger">{formErrors.storage}</p>}
              </div>

              <div>
                <label className="text-xs font-medium uppercase tracking-wider text-slate-400">Network Utilization (%)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={networkVal}
                  onChange={(e) => setNetworkVal(e.target.value)}
                  disabled={saving}
                  className={`mt-1 w-full rounded-xl border bg-bg-base/60 px-3 py-2 text-sm text-slate-100 outline-none transition-colors ${formErrors.net ? 'border-danger' : 'border-slate-700 focus:border-primary/60'} disabled:opacity-60`}
                />
                {formErrors.net && <p className="mt-1 text-[11px] text-danger">{formErrors.net}</p>}
              </div>

              <div>
                <label className="text-xs font-medium uppercase tracking-wider text-slate-400">Observation Time (Optional)</label>
                <input
                  type="datetime-local"
                  value={timestampVal}
                  onChange={(e) => setTimestampVal(e.target.value)}
                  disabled={saving}
                  className="mt-1 w-full rounded-xl border border-slate-700 bg-bg-base/60 px-3 py-2 text-sm text-slate-100 outline-none focus:border-primary/60 disabled:opacity-60"
                />
                <p className="mt-1 text-[10px] text-slate-500">Defaults to current server time if left blank.</p>
              </div>
            </div>

            {submitError && (
              <div className="flex items-center gap-2 rounded-xl border border-danger/30 bg-danger/10 px-4 py-2.5 text-sm text-danger">
                <AlertCircle size={16} /> {submitError}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setFormOpen(false)}
                disabled={saving}
                className="rounded-xl border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-800 disabled:opacity-60 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary-soft px-5 py-2 text-sm font-semibold text-white shadow-glow disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
                {saving ? 'Recording…' : 'Record Observation'}
              </button>
            </div>
          </form>
        </GlassCard>
      )}

      {submitSuccess && (
        <div className="mb-4 rounded-xl border border-success/30 bg-success/10 px-4 py-3 text-sm text-success flex items-center gap-2">
          <Activity size={16} /> {submitSuccess}
        </div>
      )}

      {/* Topology (conceptual illustration) */}
      <GlassCard className="p-5" delay={0.05}>
        <SectionTitle title="Cloud Infrastructure Topology" subtitle="Multi-region cluster map" icon={<Activity size={18} className="text-primary-soft" />} />
        {resources.length > 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="text-center py-8">
            <BarChart3 size={48} className="mx-auto text-slate-600" />
            <p className="mt-3 text-sm text-slate-400">
              {resources.length} resources across {new Set(resources.map((r) => r.region)).size} regions · {[...new Set(resources.map((r) => r.provider_type))].join(', ')}
            </p>
            <p className="mt-1 text-xs text-slate-500">Topology visualization is illustrative. Per-resource metrics below are live.</p>
          </motion.div>
        ) : (
          <p className="text-sm text-slate-400">No resources available.</p>
        )}
      </GlassCard>

      {metricsError && (
        <div className="mt-6 mb-4 flex items-center justify-between gap-2 rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
          <div className="flex items-center gap-2"><AlertCircle size={16} /> {metricsError}</div>
          {selectedId && <button onClick={() => loadMetrics(selectedId)} className="rounded-lg border border-danger/40 px-3 py-1.5 text-xs font-semibold hover:bg-danger/10 transition-colors">Retry</button>}
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* CPU utilization */}
        <GlassCard className="p-5" delay={0.1}>
          <SectionTitle title="CPU Utilization" subtitle={selected ? `${selected.name} — live historical` : 'CPU utilization'} icon={<Cpu size={18} className="text-metric-cpu" />} />
          <div className="h-56">
            {loading || metricsLoading ? <Skeleton className="h-full w-full" /> : metrics.length > 0 ? <Line data={cpuChart} options={baseChartOptions} /> : <p className="text-sm text-slate-400 pt-12 text-center">No historical metrics. Use 'Add Metric' above or sync from the Dashboard.</p>}
          </div>
        </GlassCard>

        {/* Network activity */}
        <ChartCard title="Network Activity" subtitle={selected ? `${selected.name} — network utilization` : 'Network throughput'} icon={<Network size={18} />} delay={0.15}>
          <div className="h-56">
            {loading || metricsLoading ? <Skeleton className="h-full w-full" /> : metrics.length > 0 ? <Line data={netChart} options={baseChartOptions} /> : <p className="text-sm text-slate-400 pt-12 text-center">No historical metrics available.</p>}
          </div>
        </ChartCard>
      </div>

      {/* Memory utilization chart */}
      <div className="mt-6">
        <ChartCard title="Memory Utilization" subtitle={selected ? `${selected.name} — memory utilization` : 'Memory utilization'} icon={<Network size={18} className="text-metric-memory" />} delay={0.2}>
          <div className="h-56">
            {loading || metricsLoading ? <Skeleton className="h-full w-full" /> : metrics.length > 0 ? <Line data={memChart} options={baseChartOptions} /> : <p className="text-sm text-slate-400 pt-12 text-center">No historical metrics available.</p>}
          </div>
        </ChartCard>
      </div>

      {/* Storage / health cards (live) */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {loading || metricsLoading
          ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)
          : [
              { label: 'CPU Usage', value: avg('cpu_utilization'), unit: '%', color: '#EF4444', icon: <Cpu size={18} /> },
              { label: 'Memory Usage', value: avg('memory_utilization'), unit: '%', color: '#06B6D4', icon: <Network size={18} /> },
              { label: 'Storage Usage', value: avg('storage_utilization'), unit: '%', color: '#A855F7', icon: <HardDrive size={18} /> },
              { label: 'Network I/O', value: avg('network_utilization'), unit: '%', color: '#3B82F6', icon: <Network size={18} /> },
            ].map((s, i) => (
              <GlassCard key={s.label} className="p-5" delay={0.2 + i * 0.05}>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-bg-base/60" style={{ color: s.color }}>
                    {s.icon}
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-slate-400">{s.label}</p>
                    <p className="text-xl font-bold text-slate-50">{s.value.toFixed(1)}{s.unit}</p>
                  </div>
                </div>
              </GlassCard>
            ))}
      </div>

      {/* Recent metrics table */}
      <div className="mt-6">
        <GlassCard className="p-5" delay={0.3}>
          <SectionTitle title="Recent Metrics" subtitle="Historical utilization snapshots" icon={<Activity size={18} className="text-primary-soft" />} />
          {loading || metricsLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : metrics.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-800 text-left text-xs uppercase tracking-wider text-slate-500">
                    <th className="pb-3 pr-4 font-medium">Timestamp</th>
                    <th className="pb-3 pr-4 font-medium">CPU %</th>
                    <th className="pb-3 pr-4 font-medium">Memory %</th>
                    <th className="pb-3 pr-4 font-medium">Storage %</th>
                    <th className="pb-3 font-medium">Network %</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.slice().reverse().slice(0, 10).map((m) => (
                    <tr key={m.id} className="border-b border-slate-800/50 hover:bg-bg-elevated/40">
                      <td className="py-3 pr-4 font-mono text-slate-400">{new Date(m.timestamp).toLocaleString()}</td>
                      <td className="py-3 pr-4 text-slate-200">{m.cpu_utilization.toFixed(1)}</td>
                      <td className="py-3 pr-4 text-slate-200">{m.memory_utilization.toFixed(1)}</td>
                      <td className="py-3 pr-4 text-slate-200">{m.storage_utilization.toFixed(1)}</td>
                      <td className="py-3 pr-4 text-slate-200">{m.network_utilization.toFixed(1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-slate-400">No metrics available. Use 'Add Metric' above or sync from the Dashboard.</p>
          )}
        </GlassCard>
      </div>
    </div>
  );
}
