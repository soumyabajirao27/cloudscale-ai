import React, { useState, useEffect } from 'react';
import { CloudResource, ResourceStatus } from '../types/cloudscaler';
import { resourceService } from '../services/resourceService';
import { StatusBadge } from '../components/common/StatusBadge';
import { SkeletonLoader } from '../components/common/SkeletonLoader';
import { ErrorState } from '../components/common/ErrorState';
import { EmptyState } from '../components/common/EmptyState';
import { formatINR } from '../utils/formatters';
import { Search, RefreshCw, Eye, Sparkles } from 'lucide-react';

interface ResourcesViewProps {
  onSelectResource: (resource: CloudResource) => void;
}

export const ResourcesView: React.FC<ResourcesViewProps> = ({ onSelectResource }) => {
  const [resources, setResources] = useState<CloudResource[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [syncing, setSyncing] = useState<boolean>(false);

  const loadData = async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await resourceService.getResources();
      setResources(data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSync = async () => {
    setSyncing(true);
    try {
      await resourceService.syncResources();
      await loadData();
    } finally {
      setSyncing(false);
    }
  };

  const filteredResources = resources.filter((r) => {
    const matchesSearch = r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          r.region.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          r.provider.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) return <SkeletonLoader type="table" count={3} />;
  if (error) return <ErrorState onRetry={loadData} />;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight font-mono">Cloud Resources</h1>
          <p className="text-sm text-slate-400 mt-1">
            Monitor and analyze connected infrastructure resources.
          </p>
        </div>
        <button
          onClick={handleSync}
          disabled={syncing}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-mono font-medium transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
          <span>{syncing ? 'Syncing...' : 'POST /api/v1/resources/sync'}</span>
        </button>
      </div>

      {/* Controls Bar */}
      <div className="p-4 rounded-xl bg-[#0f172a] border border-slate-800 flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search resources, regions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500 font-mono"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <label className="text-xs font-mono text-slate-400">Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-sky-500"
          >
            <option value="ALL">All Statuses (3)</option>
            <option value="UNDERUTILIZED">UNDERUTILIZED (Amber)</option>
            <option value="OPTIMAL">OPTIMAL (Green)</option>
            <option value="OVERLOADED">OVERLOADED (Red)</option>
          </select>
        </div>
      </div>

      {/* Table Container */}
      {filteredResources.length === 0 ? (
        <EmptyState
          title="No resources match filters"
          message="Try resetting your search query or status filter."
          actionLabel="Clear Filters"
          onAction={() => {
            setSearchQuery('');
            setStatusFilter('ALL');
          }}
        />
      ) : (
        <div className="rounded-xl bg-[#0f172a] border border-slate-800 overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#0b1120] text-slate-400 border-b border-slate-800 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Resource</th>
                <th className="py-3.5 px-4 font-semibold">Provider</th>
                <th className="py-3.5 px-4 font-semibold">Region</th>
                <th className="py-3.5 px-4 font-semibold">Capacity</th>
                <th className="py-3.5 px-4 font-semibold">CPU %</th>
                <th className="py-3.5 px-4 font-semibold">Memory %</th>
                <th className="py-3.5 px-4 font-semibold">Storage</th>
                <th className="py-3.5 px-4 font-semibold">Network</th>
                <th className="py-3.5 px-4 font-semibold">Status</th>
                <th className="py-3.5 px-4 font-semibold">Monthly Cost</th>
                <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredResources.map((r) => (
                <tr key={r.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-4 px-4 font-bold text-slate-100">{r.name}</td>
                  <td className="py-4 px-4 text-slate-300">{r.provider}</td>
                  <td className="py-4 px-4 text-slate-300">{r.region}</td>
                  <td className="py-4 px-4 text-sky-400 font-semibold">{r.capacity} Units</td>
                  <td className="py-4 px-4">
                    <span className={r.cpu > 80 ? 'text-red-400 font-bold' : r.cpu < 20 ? 'text-amber-400 font-bold' : 'text-emerald-400 font-bold'}>
                      {r.cpu}%
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className={r.memory > 80 ? 'text-red-400 font-bold' : r.memory < 20 ? 'text-amber-400 font-bold' : 'text-emerald-400 font-bold'}>
                      {r.memory}%
                    </span>
                  </td>
                  <td className="py-4 px-4 text-slate-400">{r.storage}%</td>
                  <td className="py-4 px-4 text-slate-400">{r.network}%</td>
                  <td className="py-4 px-4">
                    <StatusBadge status={r.status} size="sm" />
                  </td>
                  <td className="py-4 px-4 text-emerald-400 font-bold">{formatINR(r.monthlyCost)}</td>
                  <td className="py-4 px-4 text-right">
                    <button
                      onClick={() => onSelectResource(r)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/30 rounded-md transition-all text-xs font-semibold"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Details</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
