import { GlassCard } from '@/components/GlassCard';
import { PageHeader } from '@/components/PageHeader';
import { SectionTitle } from '@/components/SectionTitle';
import { Skeleton } from '@/components/Skeleton';
import { StatusBadge } from '@/components/StatusBadge';
import {
  createResource,
  deleteResource,
  getResources,
  syncResources,
  updateResource,
  type Resource,
  type ResourceCreate,
  type ResourceUpdate,
  type SyncResult,
} from '@/services/resources';
import { AlertCircle, Cloud, Edit, Plus, RefreshCw, Save, Trash2, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

const FIELD_LABELS: Record<keyof Omit<ResourceCreate, 'provider_resource_id'>, string> = {
  name: 'Name',
  provider_type: 'Provider / Type',
  region: 'Region',
  cpu_utilization: 'CPU Utilization',
  memory_utilization: 'Memory Utilization',
  storage_utilization: 'Storage Utilization',
  network_utilization: 'Network Utilization',
  current_capacity: 'Current Capacity',
  estimated_cost: 'Estimated Cost',
};

type FormErrors = Partial<Record<keyof ResourceCreate, string>>;

function emptyForm(): ResourceCreate {
  return {
    name: '',
    provider_type: '',
    region: '',
    provider_resource_id: null,
    cpu_utilization: 0,
    memory_utilization: 0,
    storage_utilization: 0,
    network_utilization: 0,
    current_capacity: 1,
    estimated_cost: 0,
  };
}

function utilizationVariant(v: number) {
  if (v > 80) return 'danger' as const;
  if (v > 60) return 'warning' as const;
  return 'success' as const;
}

export function ResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Resource | null>(null);
  const [form, setForm] = useState<ResourceCreate>(emptyForm());
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [mutateError, setMutateError] = useState<string | null>(null);
  const [mutateSuccess, setMutateSuccess] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);

  const loadResources = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getResources();
      setResources(data);
    } catch (err) {
      const msg = (err as { response?: { status?: number; data?: { message?: string | Record<string, unknown[]> } } })?.response?.data?.message;
      setError(extractMessage(msg, (err as { response?: { status?: number } })?.response?.status));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadResources();
  }, [loadResources]);

  function extractMessage(msg: unknown, status?: number): string {
    if (typeof msg === 'string') return msg;
    if (status === 403) return 'You do not have permission to access these resources.';
    return 'Failed to load resources.';
  }

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm());
    setFormErrors({});
    setMutateError(null);
    setMutateSuccess(null);
    setFormOpen(true);
  };
  const openEdit = (r: Resource) => {
    setEditing(r);
    setForm({
      name: r.name,
      provider_type: r.provider_type,
      region: r.region,
      provider_resource_id: r.provider_resource_id,
      cpu_utilization: r.cpu_utilization,
      memory_utilization: r.memory_utilization,
      storage_utilization: r.storage_utilization,
      network_utilization: r.network_utilization,
      current_capacity: r.current_capacity,
      estimated_cost: r.estimated_cost,
    });
    setFormErrors({});
    setMutateError(null);
    setMutateSuccess(null);
    setFormOpen(true);
  };
  const closeForm = () => setFormOpen(false);

  const handleChange = (field: keyof ResourceCreate, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setFormErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  function validate(f: ResourceCreate): FormErrors {
    const e: FormErrors = {};
    if (!f.name.trim()) e.name = 'Required';
    if (!f.provider_type.trim()) e.provider_type = 'Required';
    if (!f.region.trim()) e.region = 'Required';
    if (f.cpu_utilization < 0 || f.cpu_utilization > 100) e.cpu_utilization = '0–100';
    if (f.memory_utilization < 0 || f.memory_utilization > 100) e.memory_utilization = '0–100';
    return e;
  }

  const handleSubmit = useCallback(async () => {
    const errors = validate(form);
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;
    setSaving(true);
    setMutateError(null);
    setMutateSuccess(null);
    try {
      if (editing) {
        await updateResource(editing.id, { ...form } as ResourceUpdate);
        setMutateSuccess('Resource updated.');
      } else {
        await createResource(form);
        setMutateSuccess('Resource created.');
      }
      await loadResources();
      setFormOpen(false);
      setEditing(null);
    } catch (err) {
      const msg = (err as { response?: { status?: number; data?: { message?: string } } })?.response?.data?.message;
      setMutateError(extractMessage(msg, (err as { response?: { status?: number } })?.response?.status));
    } finally {
      setSaving(false);
    }
  }, [form, editing, loadResources]);

  const confirmAndDelete = useCallback(async (id: number) => {
    setDeletingId(id);
    try {
      await deleteResource(id);
      await loadResources();
      setConfirmDelete(null);
      setMutateSuccess('Resource deleted.');
    } catch (err) {
      const msg = (err as { response?: { status?: number; data?: { message?: string } } })?.response?.data?.message;
      if ((err as { response?: { status?: number } })?.response?.status === 403) {
        setMutateError('You do not have permission to delete this resource.');
      } else {
        setMutateError(extractMessage(msg, (err as { response?: { status?: number } })?.response?.status));
      }
    } finally {
      setDeletingId(null);
    }
  }, [loadResources]);

  const handleSync = useCallback(async () => {
    setSyncing(true);
    setSyncError(null);
    setSyncResult(null);
    try {
      const result = await syncResources(true);
      setSyncResult(result);
      await loadResources();
    } catch (err) {
      const status = (err as { response?: { status?: number; data?: { message?: string } } })?.response?.status;
      const msg = (err as { response?: { status?: number; data?: { message?: string } } })?.response?.data?.message;
      if (status === 401) {
        setSyncError('Authentication required. Please log in again.');
      } else if (status === 403) {
        setSyncError('Permission denied. You cannot sync resources.');
      } else {
        setSyncError(msg ?? 'Sync failed.');
      }
      // Preserve existing resource data on failure — do NOT reload.
    } finally {
      setSyncing(false);
    }
  }, [loadResources]);

  return (
    <div>
      <PageHeader
        title="Resources"
        subtitle="Manage cloud resources"
        icon={<Cloud size={24} />}
        action={
          <div className="flex items-center gap-2">
            <button
              onClick={handleSync}
              disabled={syncing}
              className="flex items-center gap-2 rounded-xl border border-slate-700 bg-bg-card/60 px-4 py-2 text-sm font-semibold text-slate-200 hover:border-primary/40 hover:text-white transition-colors disabled:opacity-60"
            >
              <RefreshCw size={16} className={syncing ? 'animate-spin' : ''} />
              {syncing ? 'Syncing…' : 'Sync from Cloud'}
            </button>
            <button
              onClick={openCreate}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary-soft px-4 py-2 text-sm font-semibold text-white shadow-glow transition-shadow hover:shadow-glow-soft"
            >
              <Plus size={16} /> Add Resource
            </button>
          </div>
        }
      />

      {error && (
        <div className="mb-4 flex items-center justify-between gap-2 rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
          <div className="flex items-center gap-2"><AlertCircle size={16} /> {error}</div>
          <button onClick={loadResources} className="rounded-lg border border-danger/40 px-3 py-1.5 text-xs font-semibold hover:bg-danger/10 transition-colors">Retry</button>
        </div>
      )}

      {syncError && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger"><AlertCircle size={16} /> {syncError} <button onClick={handleSync} className="ml-auto rounded-lg border border-danger/40 px-3 py-1.5 text-xs font-semibold hover:bg-danger/10 transition-colors">Retry</button></div>
      )}
      {syncResult && (
        <div className="mb-4 rounded-xl border border-success/30 bg-success/10 px-4 py-3 text-sm text-success flex items-center gap-2">
          <AlertCircle size={16} />
          Sync complete · {syncResult.created} created · {syncResult.updated} updated · {syncResult.unchanged} unchanged · provider: {syncResult.provider}
        </div>
      )}

      {mutateError && (
        <div className="mb-4 rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">{mutateError}</div>
      )}
      {mutateSuccess && (
        <div className="mb-4 rounded-xl border border-success/30 bg-success/10 px-4 py-3 text-sm text-success flex items-center gap-2"><AlertCircle size={16} /> {mutateSuccess}</div>
      )}

      {/* Inline Create/Edit form */}
      {formOpen && (
        <GlassCard className="p-5 mb-6" delay={0.05}>
          <div className="flex items-center justify-between">
            <SectionTitle title={editing ? 'Edit Resource' : 'Add Resource'} icon={<Cloud size={18} className="text-primary-soft" />} />
            <button onClick={closeForm} className="rounded-lg p-1 text-slate-400 hover:bg-bg-elevated/60 hover:text-slate-200 transition-colors">
              <X size={18} />
            </button>
          </div>
          <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {(['name', 'provider_type', 'region', 'cpu_utilization', 'memory_utilization', 'storage_utilization', 'network_utilization', 'current_capacity', 'estimated_cost'] as const).map((field) => {
              const label = FIELD_LABELS[field];
              const isNumber = field.includes('utilization') || field === 'current_capacity' || field === 'estimated_cost';
              const val = form[field];
              const hasError = Boolean(formErrors[field]);
              return (
                <div key={field}>
                  <label className="text-xs font-medium uppercase tracking-wider text-slate-400">{label}</label>
                  <input
                    type={isNumber ? 'number' : 'text'}
                    value={val === null ? '' : String(val)}
                    onChange={(e) => handleChange(field, isNumber ? e.target.value : e.target.value)}
                    disabled={saving}
                    className={`mt-1 w-full rounded-xl border bg-bg-base/60 px-3 py-2 text-sm text-slate-100 outline-none transition-colors ${hasError ? 'border-danger' : 'border-slate-700 focus:border-primary/60'} disabled:opacity-60`}
                  />
                  {hasError && <p className="mt-1 text-[11px] text-danger">{formErrors[field]}</p>}
                </div>
              );
            })}
            <div>
              <label className="text-xs font-medium uppercase tracking-wider text-slate-400">Provider Resource ID</label>
              <input
                type="text"
                value={form.provider_resource_id ?? ''}
                onChange={(e) => setForm((prev) => ({ ...prev, provider_resource_id: e.target.value || null }))}
                disabled={saving}
                placeholder="Optional (e.g. i-0a1b2c)"
                className="mt-1 w-full rounded-xl border border-slate-700 bg-bg-base/60 px-3 py-2 text-sm text-slate-100 outline-none focus:border-primary/60 disabled:opacity-60"
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <button onClick={closeForm} disabled={saving} className="rounded-xl border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-800 disabled:opacity-60 transition-colors">Cancel</button>
            <button onClick={handleSubmit} disabled={saving} className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary-soft px-5 py-2 text-sm font-semibold text-white shadow-glow disabled:cursor-not-allowed disabled:opacity-60">
              {saving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
              {saving ? 'Saving…' : editing ? 'Update' : 'Create'}
            </button>
          </div>
        </GlassCard>
      )}

      {/* Resource list */}
      <GlassCard className="p-5" delay={0.1}>
        <SectionTitle title="Resource List" subtitle={`${resources.length} resources`} icon={<Cloud size={18} className="text-primary-soft" />} />
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-11 w-full" />
            ))}
          </div>
        ) : resources.length === 0 ? (
          <div className="py-8 text-center">
            <Cloud size={40} className="mx-auto text-slate-600" />
            <p className="mt-3 text-sm text-slate-400">No resources found. Click "Add Resource" or sync from the Dashboard.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-left text-xs uppercase tracking-wider text-slate-500">
                  <th className="pb-3 pl-3 font-medium">Resource</th>
                  <th className="pb-3 pr-3 font-medium">Provider</th>
                  <th className="pb-3 pr-3 font-medium">Region</th>
                  <th className="pb-3 pr-3 font-medium">CPU</th>
                  <th className="pb-3 pr-3 font-medium">Memory</th>
                  <th className="pb-3 pr-3 font-medium">Storage</th>
                  <th className="pb-3 pr-3 font-medium">Network</th>
                  <th className="pb-3 pr-3 font-medium">Capacity</th>
                  <th className="pb-3 pr-3 font-medium">Cost/mo</th>
                  <th className="pb-3 pr-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {resources.map((r) => (
                  <tr key={r.id} className="border-b border-slate-800/50 hover:bg-bg-elevated/40">
                    <td className="py-3 pl-3 pr-3 font-semibold text-slate-100">{r.name}</td>
                    <td className="py-3 pr-3 text-slate-300">{r.provider_type}</td>
                    <td className="py-3 pr-3 text-slate-300">{r.region}</td>
                    <td className="py-3 pr-3"><StatusBadge variant={utilizationVariant(r.cpu_utilization)}>{r.cpu_utilization.toFixed(1)}%</StatusBadge></td>
                    <td className="py-3 pr-3"><StatusBadge variant={utilizationVariant(r.memory_utilization)}>{r.memory_utilization.toFixed(1)}%</StatusBadge></td>
                    <td className="py-3 pr-3 text-slate-300">{r.storage_utilization.toFixed(1)}%</td>
                    <td className="py-3 pr-3 text-slate-300">{r.network_utilization.toFixed(1)}%</td>
                    <td className="py-3 pr-3 text-slate-300">{r.current_capacity}</td>
                    <td className="py-3 pr-3 text-success">${r.estimated_cost.toFixed(2)}</td>
                    <td className="py-3 pr-3">
                      <div className="flex justify-end gap-1.5">
                        {confirmDelete === r.id ? (
                          <>
                            <button
                              onClick={() => confirmAndDelete(r.id)}
                              disabled={deletingId === r.id}
                              className="rounded-lg border border-danger/40 px-2 py-1 text-xs font-semibold text-danger hover:bg-danger/10 disabled:opacity-60 transition-colors"
                            >
                              {deletingId === r.id ? '…' : 'Confirm'}
                            </button>
                            <button
                              onClick={() => setConfirmDelete(null)}
                              className="rounded-lg border border-slate-700 px-2 py-1 text-xs font-semibold text-slate-300 hover:bg-slate-800 disabled:opacity-60 transition-colors"
                            >
                              <X size={12} />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => openEdit(r)}
                              className="rounded-lg border border-slate-700 p-1.5 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                              title="Edit"
                            >
                              <Edit size={14} />
                            </button>
                            <button
                              onClick={() => setConfirmDelete(r.id)}
                              className="rounded-lg border border-slate-700 p-1.5 text-slate-300 hover:bg-danger/10 hover:text-danger transition-colors"
                              title="Delete"
                            >
                              <Trash2 size={14} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>
    </div>
  );
}
