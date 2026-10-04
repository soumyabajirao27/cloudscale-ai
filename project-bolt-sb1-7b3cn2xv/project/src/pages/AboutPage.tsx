import { Info, Target, AlertTriangle, Search, Workflow, Cpu, Cloud, BrainCircuit, Rocket } from 'lucide-react';
import { motion } from 'framer-motion';
import { PageHeader } from '@/components/PageHeader';
import { GlassCard } from '@/components/GlassCard';
import { SectionTitle } from '@/components/SectionTitle';

const stack = ['React 18', 'Vite', 'React Router', 'Framer Motion', 'Chart.js', 'Lucide React', 'Tailwind CSS', 'FastAPI (planned)', 'PyTorch LSTM (planned)', 'Supabase (planned)'];

const cloudConcepts = ['Auto Scaling Groups', 'Horizontal/Vertical Scaling', 'Right-Sizing', 'Multi-Region', 'Load Balancing', 'Spot Instances', 'Reserved Capacity', 'Cost Allocation'];
const aiConcepts = ['LSTM Time-Series Forecasting', 'Supervised Regression', 'Anomaly Detection', 'SHAP Explainability', 'Reinforcement Feedback', 'Confidence Intervals'];

export function AboutPage() {
  return (
    <div>
      <PageHeader title="About" subtitle="Project overview & technical foundation" icon={<Info size={24} />} />

      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="glass-strong relative overflow-hidden rounded-2xl p-8 shadow-card"
      >
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-metric-memory/10 blur-3xl" />
        <div className="relative">
          <h2 className="text-2xl font-bold text-slate-50 md:text-3xl">
            Machine Learning-Driven Auto Scaling &amp; Cost Optimization
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-300">
            An AI-powered cloud operations framework that predicts workload demand, recommends intelligent scaling actions,
            optimizes cloud spend, and explains every decision it makes — closing the gap between reactive cloud management
            and proactive, intelligent automation.
          </p>
        </div>
      </motion.div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <GlassCard className="p-5" delay={0.1}>
          <SectionTitle title="Objective" icon={<Target size={18} className="text-primary-soft" />} />
          <p className="text-sm leading-relaxed text-slate-300">
            Build a framework that uses machine learning (LSTM) to forecast cloud resource demand and automatically
            optimize auto-scaling decisions, reducing cost while maintaining performance and reliability.
          </p>
        </GlassCard>

        <GlassCard className="p-5" delay={0.15}>
          <SectionTitle title="Problem Statement" icon={<AlertTriangle size={18} className="text-warning" />} />
          <p className="text-sm leading-relaxed text-slate-300">
            Traditional cloud auto-scaling relies on static thresholds and reactive rules, leading to over-provisioning,
            slow responses to traffic spikes, and unnecessary cost. There is no predictive intelligence or explainability
            behind scaling decisions.
          </p>
        </GlassCard>

        <GlassCard className="p-5" delay={0.2}>
          <SectionTitle title="Research Gap" icon={<Search size={18} className="text-metric-memory" />} />
          <p className="text-sm leading-relaxed text-slate-300">
            Existing solutions lack predictive workload forecasting combined with explainable AI. Most auto-scalers are
            black-box and reactive. Integrating LSTM forecasting with SHAP-based explanations in a unified platform is
            an underexplored area.
          </p>
        </GlassCard>

        <GlassCard className="p-5" delay={0.25}>
          <SectionTitle title="Methodology" icon={<Workflow size={18} className="text-success" />} />
          <ol className="space-y-2 text-sm text-slate-300">
            {['Collect historical cloud metrics (CPU, memory, network, requests)', 'Train LSTM model for multi-horizon forecasting', 'Generate scaling recommendations from predictions', 'Apply SHAP for feature attribution & explanations', 'Compare ML approach vs traditional static scaling'].map((s, i) => (
              <li key={i} className="flex gap-3">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary-soft">{i + 1}</span>
                {s}
              </li>
            ))}
          </ol>
        </GlassCard>
      </div>

      {/* Architecture placeholder */}
      <div className="mt-6">
        <GlassCard className="p-5" delay={0.3}>
          <SectionTitle title="System Architecture" subtitle="End-to-end data flow" icon={<Cpu size={18} className="text-primary-soft" />} />
          <div className="flex flex-wrap items-center justify-center gap-3 py-8">
            {['Cloud Metrics', 'Data Pipeline', 'LSTM Model', 'Predictions', 'Scaling Engine', 'Explainability', 'Dashboard'].map((node, i) => (
              <div key={node} className="flex items-center gap-3">
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + i * 0.08 }}
                  className="rounded-xl border border-slate-700 bg-bg-elevated px-4 py-3 text-sm font-semibold text-slate-200"
                >
                  {node}
                </motion.div>
                {i < 6 && <span className="text-slate-600">→</span>}
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <GlassCard className="p-5" delay={0.35}>
          <SectionTitle title="Technology Stack" icon={<Cpu size={18} className="text-primary-soft" />} />
          <div className="flex flex-wrap gap-2">
            {stack.map((s) => (
              <span key={s} className="rounded-lg border border-slate-700 bg-bg-base/40 px-3 py-1.5 text-xs font-medium text-slate-300">{s}</span>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="p-5" delay={0.4}>
          <SectionTitle title="Cloud Concepts" icon={<Cloud size={18} className="text-metric-network" />} />
          <div className="flex flex-wrap gap-2">
            {cloudConcepts.map((s) => (
              <span key={s} className="rounded-lg border border-metric-network/30 bg-metric-network/10 px-3 py-1.5 text-xs font-medium text-metric-network">{s}</span>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="p-5" delay={0.45}>
          <SectionTitle title="AI Concepts" icon={<BrainCircuit size={18} className="text-metric-disk" />} />
          <div className="flex flex-wrap gap-2">
            {aiConcepts.map((s) => (
              <span key={s} className="rounded-lg border border-metric-disk/30 bg-metric-disk/10 px-3 py-1.5 text-xs font-medium text-metric-disk">{s}</span>
            ))}
          </div>
        </GlassCard>
      </div>

      <div className="mt-6">
        <GlassCard className="p-5" delay={0.5}>
          <SectionTitle title="Future Scope" icon={<Rocket size={18} className="text-success" />} />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {['Multi-cloud support (AWS, Azure, GCP)', 'Real-time anomaly auto-remediation', 'Reinforcement learning for cost optimization', 'Federated learning across regions', 'Edge workload prediction', 'Integration with Kubernetes operators'].map((f) => (
              <div key={f} className="flex items-center gap-2 rounded-lg bg-bg-base/40 p-3 text-sm text-slate-300">
                <span className="h-1.5 w-1.5 rounded-full bg-success" />
                {f}
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
