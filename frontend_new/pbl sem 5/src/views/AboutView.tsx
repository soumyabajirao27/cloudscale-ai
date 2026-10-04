import React from 'react';
import { Cloud, Brain, Sparkles, Award, ExternalLink } from 'lucide-react';

export const AboutView: React.FC = () => {
  return (
    <div className="space-y-8 animate-fadeIn max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-100 tracking-tight font-mono">About CloudScaler</h1>
        <p className="text-sm text-slate-400 mt-1">AI-Powered Cloud Operations Platform — Project PBL Sem 5</p>
      </div>

      <div className="p-8 rounded-2xl bg-[#0f172a] border border-slate-800 space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-xl shadow-sky-500/20">
            <Cloud className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-100 font-mono">CloudScaler Enterprise Engine</h2>
            <p className="text-xs text-sky-400 font-mono">PBL Sem 5 Project • Portfolio-Ready Enterprise SaaS Redesign</p>
          </div>
        </div>

        <p className="text-xs text-slate-300 font-mono leading-relaxed">
          CloudScaler is an end-to-end AI/ML driven cloud operations and FinOps decision framework. It continuously monitors cloud resource metrics (CPU, Memory, Storage, Network), predicts demand spikes using an LSTM neural network, classifies utilization states (UNDERUTILIZED, OPTIMAL, OVERLOADED), and delivers explainable right-sizing and auto-scaling recommendations.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs pt-4 border-t border-slate-800">
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
            <div className="text-sky-400 font-bold">FastAPI Backend Integration</div>
            <div className="text-slate-400 text-[11px]">Designed API-first to connect directly to <code className="text-slate-200">http://localhost:8000</code>.</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
            <div className="text-emerald-400 font-bold">Explainable AI (XAI)</div>
            <div className="text-slate-400 text-[11px]">Feature attribution weights and 4-step auditable reasoning pathways.</div>
          </div>
        </div>
      </div>
    </div>
  );
};
