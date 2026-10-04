import { PageHeader } from '@/components/PageHeader';
import { SettingsCard } from '@/components/SettingsCard';
import { Skeleton } from '@/components/Skeleton';
import { StatusBadge } from '@/components/StatusBadge';
import { getCurrentUser, updateUser, type UserMe } from '@/services/users';
import { Cloud, Gauge, Palette, RefreshCw, Save, Settings, SlidersHorizontal, User } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!on)}
      className={`relative h-6 w-11 rounded-full transition-colors ${on ? 'bg-primary' : 'bg-slate-700'}`}
    >
      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${on ? 'left-[22px]' : 'left-0.5'}`} />
    </button>
  );
}

export function SettingsPage() {
  const [animations, setAnimations] = useState(true);
  const [autoScale, setAutoScale] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [simSpeed, setSimSpeed] = useState(1);
  const [profile, setProfile] = useState('aws');
  const [cpuThreshold, setCpuThreshold] = useState(75);
  const [memThreshold, setMemThreshold] = useState(80);

  const [user, setUser] = useState<UserMe | null>(null);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [loadingUser, setLoadingUser] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const loadUser = useCallback(async () => {
    setLoadingUser(true);
    setSaveError(null);
    try {
      const data = await getCurrentUser();
      setUser(data);
      setFullName(data.full_name);
      setEmail(data.email);
    } catch (err) {
      setSaveError((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to load user profile.');
      setUser(null);
    } finally {
      setLoadingUser(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const handleSave = useCallback(async () => {
    if (!user) return;
    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);
    try {
      const updated = await updateUser(user.id, { full_name: fullName, email });
      setUser(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setSaveError((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to update user profile.');
    } finally {
      setSaving(false);
    }
  }, [user, fullName, email]);

  return (
    <div>
      <PageHeader title="Settings" subtitle="Configure platform preferences & scaling thresholds" icon={<Settings size={24} />} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Account (live user profile) */}
        <SettingsCard title="Account" description="Your profile & account status" icon={<User size={18} />}>
          {loadingUser ? (
            <div className="space-y-3">
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-5 w-48" />
            </div>
          ) : user ? (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium uppercase tracking-wider text-slate-400">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => { setFullName(e.target.value); setSaveSuccess(false); }}
                  disabled={saving}
                  className="mt-1 w-full rounded-xl border border-slate-700 bg-bg-base/60 px-3 py-2 text-sm text-slate-100 outline-none focus:border-primary/60 disabled:opacity-60"
                />
              </div>
              <div>
                <label className="text-xs font-medium uppercase tracking-wider text-slate-400">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setSaveSuccess(false); }}
                  disabled={saving}
                  className="mt-1 w-full rounded-xl border border-slate-700 bg-bg-base/60 px-3 py-2 text-sm text-slate-100 outline-none focus:border-primary/60 disabled:opacity-60"
                />
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Status:</span>
                  <StatusBadge variant={user.is_active ? 'success' : 'danger'}>{user.is_active ? 'Active' : 'Inactive'}</StatusBadge>
                </div>
                {user.is_superuser && <StatusBadge variant="primary">Admin</StatusBadge>}
              </div>
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={handleSave}
                  disabled={saving || !user}
                  className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary-soft px-5 py-2 text-sm font-semibold text-white shadow-glow transition-shadow hover:shadow-glow-soft disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
                  {saving ? 'Saving…' : 'Save Profile'}
                </button>
                {saveError && <span className="text-xs text-danger">{saveError}</span>}
                {saveSuccess && <span className="text-xs text-success">Saved!</span>}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <span className="text-sm text-danger">{saveError || 'No user data'}</span>
              <button onClick={loadUser} className="flex items-center gap-1 rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-semibold hover:bg-slate-800 transition-colors">
                <RefreshCw size={12} /> Retry
              </button>
            </div>
          )}
        </SettingsCard>

        <SettingsCard title="Appearance" description="Theme & visual preferences" icon={<Palette size={18} />}>
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-300">Dark Theme</span>
            <StatusBadge variant="primary">Active</StatusBadge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-300">Animations</span>
            <Toggle on={animations} onChange={setAnimations} />
          </div>
        </SettingsCard>

        <SettingsCard title="Simulation" description="Simulation speed & behavior" icon={<Gauge size={18} />}>
          <div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-300">Simulation Speed</span>
              <span className="font-semibold text-primary-soft">{simSpeed}×</span>
            </div>
            <input type="range" min={0.5} max={5} step={0.5} value={simSpeed} onChange={(e) => setSimSpeed(Number(e.target.value))} className="mt-2 w-full accent-primary" />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-300">Auto-scaling</span>
            <Toggle on={autoScale} onChange={setAutoScale} />
          </div>
        </SettingsCard>

        <SettingsCard title="Cloud Profile" description="Target cloud provider" icon={<Cloud size={18} />}>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'aws', label: 'AWS' },
              { id: 'azure', label: 'Azure' },
              { id: 'gcp', label: 'GCP' },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => setProfile(p.id)}
                className={`rounded-xl border px-4 py-3 text-sm font-semibold transition-colors ${
                  profile === p.id ? 'border-primary bg-primary/15 text-primary-soft' : 'border-slate-700 bg-bg-base/40 text-slate-400 hover:text-slate-200'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </SettingsCard>

        <SettingsCard title="Scaling Thresholds" description="Trigger points for auto-scaling" icon={<SlidersHorizontal size={18} />}>
          <div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-300">CPU Scale-Up Threshold</span>
              <span className="font-semibold text-metric-cpu">{cpuThreshold}%</span>
            </div>
            <input type="range" min={50} max={95} value={cpuThreshold} onChange={(e) => setCpuThreshold(Number(e.target.value))} className="mt-2 w-full accent-metric-cpu" />
          </div>
          <div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-300">Memory Scale-Up Threshold</span>
              <span className="font-semibold text-metric-memory">{memThreshold}%</span>
            </div>
            <input type="range" min={50} max={95} value={memThreshold} onChange={(e) => setMemThreshold(Number(e.target.value))} className="mt-2 w-full accent-metric-memory" />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-300">Notifications</span>
            <Toggle on={notifications} onChange={setNotifications} />
          </div>
        </SettingsCard>
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <button className="rounded-xl border border-slate-700 px-5 py-2.5 text-sm font-semibold text-slate-300 hover:bg-slate-800 transition-colors">
          Reset
        </button>
        <button
          onClick={handleSave}
          disabled={saving || !user}
          className="rounded-xl bg-gradient-to-r from-primary to-primary-soft px-6 py-2.5 text-sm font-semibold text-white shadow-glow hover:shadow-glow-soft transition-shadow disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? <RefreshCw size={16} className="animate-spin" /> : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
