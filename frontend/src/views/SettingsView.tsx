import React from 'react';
import { Settings, Server, Database, Key, Shield, Bell } from 'lucide-react';

export const SettingsView: React.FC = () => {
  return (
    <div className="space-y-8 animate-fadeIn">
      <div>
        <h1 className="text-2xl font-bold text-slate-100 tracking-tight font-mono">System Settings</h1>
        <p className="text-sm text-slate-400 mt-1">Configure backend endpoints, telemetry sync intervals, and model thresholds.</p>
      </div>

      <div className="p-6 rounded-2xl bg-[#0f172a] border border-slate-800 space-y-6 max-w-3xl">
        <div className="space-y-4">
          <h2 className="text-base font-bold text-slate-200 font-mono flex items-center gap-2">
            <Server className="w-4 h-4 text-sky-400" /> API Connection Parameters
          </h2>

          <div className="space-y-3 font-mono text-xs">
            <div>
              <label className="text-slate-400 block mb-1">FastAPI Backend Base URL</label>
              <input
                type="text"
                readOnly
                value="http://localhost:8000"
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-200"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Telemetry Sync Frequency</label>
              <select className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-200">
                <option>Every 60 seconds (Real-time)</option>
                <option>Every 5 minutes</option>
                <option>Every 15 minutes</option>
              </select>
            </div>
          </div>
        </div>

        <div className="space-y-4 border-t border-slate-800 pt-6">
          <h2 className="text-base font-bold text-slate-200 font-mono flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-400" /> Threshold Rules Engine
          </h2>

          <div className="grid grid-cols-2 gap-4 font-mono text-xs">
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-slate-400">Overloaded CPU Threshold</span>
              <div className="text-lg font-bold text-red-400">&gt; 80% Utilization</div>
            </div>

            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-slate-400">Underutilized CPU Threshold</span>
              <div className="text-lg font-bold text-amber-400">&lt; 20% Utilization</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
