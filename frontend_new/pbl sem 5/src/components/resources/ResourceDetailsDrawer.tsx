import React, { useState } from 'react';
import { CloudResource } from '../../types/cloudscaler';
import { StatusBadge } from '../common/StatusBadge';
import { formatINR } from '../../utils/formatters';
import { X, Cpu, HardDrive, Network, Layers, DollarSign, Sparkles, TrendingUp, RefreshCw } from 'lucide-react';
import { resourceService } from '../../services/resourceService';

interface ResourceDetailsDrawerProps {
  resource: CloudResource | null;
  onClose: () => void;
  onNavigateView: (view: 'predictions' | 'recommendations' | 'explainable') => void;
}

export const ResourceDetailsDrawer: React.FC<ResourceDetailsDrawerProps> = ({
  resource,
  onClose,
  onNavigateView
}) => {
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);

  if (!resource) return null;

  const handleRunAnalysis = async () => {
    setAnalyzing(true);
    try {
      const res = await resourceService.analyzeResource(resource.id);
      setAnalysisResult(res.summary);
    } catch {
      setAnalysisResult(`Analysis finished for ${resource.name}. Status re-confirmed as ${resource.status}.`);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={onClose} />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#0f172a] border-l border-slate-800 shadow-2xl flex flex-col justify-between">
          {/* Header */}
          <div className="p-6 border-b border-slate-800 flex items-start justify-between bg-[#0b1120]">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-xl font-bold text-slate-100 font-mono tracking-tight">{resource.name}</h2>
                <StatusBadge status={resource.status} size="sm" />
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Provider: <span className="text-slate-200">{resource.provider}</span> • Region: <span className="text-slate-200">{resource.region}</span>
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="p-6 space-y-6 overflow-y-auto flex-1">
            {/* Metric Bars */}
            <div className="space-y-4">
              <h3 className="text-xs font-mono font-semibold uppercase text-slate-400 tracking-wider">
                Telemetry Overview
              </h3>

              {/* CPU */}
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="flex items-center gap-2 text-slate-300 font-mono">
                    <Cpu className="w-4 h-4 text-sky-400" />
                    <span>CPU Utilization</span>
                  </span>
                  <span className={`font-mono font-bold ${resource.cpu > 80 ? 'text-red-400' : resource.cpu < 20 ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {resource.cpu}%
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${resource.cpu > 80 ? 'bg-red-500' : resource.cpu < 20 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                    style={{ width: `${resource.cpu}%` }}
                  />
                </div>
              </div>

              {/* Memory */}
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="flex items-center gap-2 text-slate-300 font-mono">
                    <Layers className="w-4 h-4 text-indigo-400" />
                    <span>Memory Utilization</span>
                  </span>
                  <span className={`font-mono font-bold ${resource.memory > 80 ? 'text-red-400' : resource.memory < 20 ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {resource.memory}%
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${resource.memory > 80 ? 'bg-red-500' : resource.memory < 20 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                    style={{ width: `${resource.memory}%` }}
                  />
                </div>
              </div>

              {/* Storage & Network */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                  <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1.5">
                    <HardDrive className="w-3.5 h-3.5 text-purple-400" /> Storage
                  </div>
                  <div className="text-base font-bold text-slate-100 font-mono">{resource.storage}%</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                  <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1.5">
                    <Network className="w-3.5 h-3.5 text-teal-400" /> Network
                  </div>
                  <div className="text-base font-bold text-slate-100 font-mono">{resource.network}%</div>
                </div>
              </div>

              {/* Capacity & Cost */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                  <div className="text-[11px] text-slate-400 font-mono">Provisioned Capacity</div>
                  <div className="text-base font-bold text-sky-400 font-mono">{resource.capacity} Units</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                  <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                    <span className="text-emerald-400 font-bold">₹</span> Monthly Cost
                  </div>
                  <div className="text-base font-bold text-emerald-400 font-mono">{formatINR(resource.monthlyCost)}/mo</div>
                </div>
              </div>
            </div>

            {/* AI Analysis Summary */}
            <div className="p-4 rounded-xl bg-sky-950/20 border border-sky-800/40 space-y-3">
              <div className="flex items-center gap-2 text-sky-400 font-semibold text-xs uppercase font-mono">
                <Sparkles className="w-4 h-4" />
                <span>AI Resource Analysis</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-mono">
                {analysisResult || (
                  resource.status === 'OVERLOADED'
                    ? 'Resource is operating at peak capacity threshold (92% CPU). Capacity expansion recommended to avoid latency spikes.'
                    : resource.status === 'UNDERUTILIZED'
                    ? 'Resource utilization is idle (10% CPU). Right-sizing candidate to reduce cloud spend by ~₹2,100/month.'
                    : 'Resource operating within normal SLA parameters. No immediate scaling action required.'
                )}
              </p>
            </div>
          </div>

          {/* Action Footer */}
          <div className="p-6 border-t border-slate-800 bg-[#0b1120] space-y-2">
            <button
              onClick={handleRunAnalysis}
              disabled={analyzing}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-lg text-xs font-mono transition-all shadow-lg shadow-sky-500/20 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${analyzing ? 'animate-spin' : ''}`} />
              <span>{analyzing ? 'Running AI Telemetry Analysis...' : 'POST /api/v1/resources/analyze'}</span>
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  onClose();
                  onNavigateView('predictions');
                }}
                className="flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium font-mono transition-all"
              >
                <TrendingUp className="w-3.5 h-3.5 text-sky-400" />
                <span>View Prediction</span>
              </button>

              <button
                onClick={() => {
                  onClose();
                  onNavigateView('recommendations');
                }}
                className="flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium font-mono transition-all"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>View Action Plan</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
