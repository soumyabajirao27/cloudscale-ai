import React, { useState, useEffect } from 'react';
import { CloudResource } from '../types/cloudscaler';
import { resourceService } from '../services/resourceService';
import { StatusBadge } from '../components/common/StatusBadge';
import { SkeletonLoader } from '../components/common/SkeletonLoader';
import { formatINR } from '../utils/formatters';
import { Columns, Cpu, Layers, HardDrive, Network, DollarSign, Server } from 'lucide-react';

export const ComparisonView: React.FC = () => {
  const [resources, setResources] = useState<CloudResource[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await resourceService.getResources();
        setResources(res);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <SkeletonLoader type="table" count={3} />;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-100 tracking-tight font-mono">Resource Telemetry Matrix</h1>
        <p className="text-sm text-slate-400 mt-1">
          Side-by-side comparative analysis across compute, memory, cost (₹) and AI classification states.
        </p>
      </div>

      {/* Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {resources.map((res) => (
          <div
            key={res.id}
            className={`p-6 rounded-2xl bg-[#0f172a] border space-y-6 transition-all ${
              res.status === 'OVERLOADED'
                ? 'border-red-500/40 bg-red-950/10'
                : res.status === 'UNDERUTILIZED'
                ? 'border-amber-500/30 bg-amber-950/10'
                : 'border-slate-800'
            }`}
          >
            {/* Header */}
            <div className="border-b border-slate-800 pb-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-slate-400 uppercase">{res.provider}</span>
                <StatusBadge status={res.status} size="sm" />
              </div>
              <h3 className="text-lg font-bold text-slate-100 font-mono">{res.name}</h3>
              <div className="text-xs text-slate-400 font-mono">Region: {res.region}</div>
            </div>

            {/* Metrics List */}
            <div className="space-y-4 font-mono text-xs">
              {/* CPU */}
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400 flex items-center gap-1.5"><Cpu className="w-3.5 h-3.5 text-sky-400" /> CPU Utilization</span>
                  <span className={`font-bold ${res.cpu > 80 ? 'text-red-400' : res.cpu < 20 ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {res.cpu}%
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${res.cpu > 80 ? 'bg-red-500' : res.cpu < 20 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                    style={{ width: `${res.cpu}%` }}
                  />
                </div>
              </div>

              {/* Memory */}
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400 flex items-center gap-1.5"><Layers className="w-3.5 h-3.5 text-indigo-400" /> Memory Utilization</span>
                  <span className={`font-bold ${res.memory > 80 ? 'text-red-400' : res.memory < 20 ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {res.memory}%
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${res.memory > 80 ? 'bg-red-500' : res.memory < 20 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                    style={{ width: `${res.memory}%` }}
                  />
                </div>
              </div>

              {/* Storage */}
              <div className="flex justify-between p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                <span className="text-slate-400 flex items-center gap-1.5"><HardDrive className="w-3.5 h-3.5 text-purple-400" /> Storage Usage</span>
                <span className="font-bold text-slate-200">{res.storage}%</span>
              </div>

              {/* Network */}
              <div className="flex justify-between p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                <span className="text-slate-400 flex items-center gap-1.5"><Network className="w-3.5 h-3.5 text-teal-400" /> Network Bandwidth</span>
                <span className="font-bold text-slate-200">{res.network}%</span>
              </div>

              {/* Provisioned Capacity */}
              <div className="flex justify-between p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                <span className="text-slate-400 flex items-center gap-1.5"><Server className="w-3.5 h-3.5 text-sky-400" /> Capacity</span>
                <span className="font-bold text-sky-400">{res.capacity} Units</span>
              </div>

              {/* Monthly Cost (INR) */}
              <div className="flex justify-between p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                <span className="text-slate-400 flex items-center gap-1.5"><span className="text-emerald-400 font-bold">₹</span> Monthly Cost</span>
                <span className="font-bold text-emerald-400 text-sm">{formatINR(res.monthlyCost)}/mo</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
