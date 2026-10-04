// Centralized placeholder data for the frontend. Designed to be swapped with
// real API responses later without touching component contracts.

export type Trend = 'up' | 'down' | 'flat';

export interface MetricSummary {
  id: string;
  label: string;
  value: number;
  unit: string;
  trend: Trend;
  delta: number;
  color: string;
  spark: number[];
}

export const dashboardMetrics: MetricSummary[] = [
  { id: 'cpu', label: 'CPU Usage', value: 68.4, unit: '%', trend: 'up', delta: 4.2, color: '#EF4444', spark: [42, 48, 51, 55, 60, 64, 68] },
  { id: 'memory', label: 'Memory Usage', value: 73.1, unit: '%', trend: 'up', delta: 2.8, color: '#06B6D4', spark: [60, 62, 65, 68, 70, 72, 73] },
  { id: 'network', label: 'Network I/O', value: 1.24, unit: 'Gb/s', trend: 'down', delta: -0.3, color: '#3B82F6', spark: [1.8, 1.6, 1.5, 1.4, 1.3, 1.25, 1.24] },
  { id: 'disk', label: 'Disk Usage', value: 54.7, unit: '%', trend: 'flat', delta: 0.1, color: '#A855F7', spark: [54, 54, 55, 54, 55, 54, 55] },
  { id: 'requests', label: 'Requests / sec', value: 8420, unit: 'rps', trend: 'up', delta: 612, color: '#EC4899', spark: [6200, 6800, 7100, 7600, 7900, 8200, 8420] },
  { id: 'instances', label: 'Active Instances', value: 24, unit: 'nodes', trend: 'up', delta: 3, color: '#10B981', spark: [18, 19, 21, 20, 22, 23, 24] },
];

export const liveMetricsLabels = ['00:00', '03:00', '06:00', '09:00', '12:00', '15:00', '18:00', '21:00'];
export const liveMetrics = {
  cpu: [45, 52, 58, 61, 68, 72, 69, 65],
  memory: [60, 63, 66, 70, 73, 75, 74, 72],
  network: [1.1, 1.3, 1.5, 1.4, 1.2, 1.0, 1.1, 1.24],
  requests: [6200, 6800, 7100, 7600, 7900, 8200, 8000, 8420],
};

export interface ActivityItem {
  id: string;
  title: string;
  detail: string;
  time: string;
  type: 'scale' | 'cost' | 'predict' | 'anomaly' | 'system';
}

export const recentActivity: ActivityItem[] = [
  { id: 'a1', title: 'Auto-scaled cluster us-east-1', detail: 'Added 3 nodes (c5.xlarge) based on 15-min forecast', time: '2 min ago', type: 'scale' },
  { id: 'a2', title: 'Anomaly detected on network I/O', detail: 'Spike 2.4σ above baseline — flagged for review', time: '14 min ago', type: 'anomaly' },
  { id: 'a3', title: 'Right-sizing recommendation accepted', detail: 'Downsized 2 over-provisioned instances — saving $312/mo', time: '38 min ago', type: 'cost' },
  { id: 'a4', title: 'Prediction model retrained', detail: 'LSTM model v2.4.1 — accuracy 94.2%', time: '1 hr ago', type: 'predict' },
  { id: 'a5', title: 'Cost optimization sweep complete', detail: 'Identified $1,840/mo in potential savings', time: '2 hr ago', type: 'cost' },
];

export interface PredictionCard {
  id: string;
  label: string;
  value: string;
  hint: string;
}

export const predictionCards: PredictionCard[] = [
  { id: 'confidence', label: 'Prediction Confidence', value: '94.2%', hint: 'Model certainty on next-hour forecast' },
  { id: 'horizon', label: 'Forecast Horizon', value: '15 min', hint: 'Short-term scaling lookahead window' },
  { id: 'accuracy', label: 'Prediction Accuracy', value: '91.7%', hint: 'MAPE over last 7 days' },
];

export const predictionForecast = {
  labels: ['Now', '+2m', '+4m', '+6m', '+8m', '+10m', '+12m', '+15m'],
  actual: [68, 69, 71, 70, 72, 73, 74, 73],
  predicted: [68, 70, 73, 75, 78, 82, 85, 88],
  upper: [70, 73, 77, 80, 84, 88, 92, 96],
  lower: [66, 67, 69, 70, 70, 68, 66, 64],
};

export interface ScalingRec {
  id: string;
  resource: string;
  action: 'scale-up' | 'scale-down' | 'hold';
  urgency: 'critical' | 'high' | 'medium' | 'low';
  from: number;
  to: number;
  reason: string;
  eta: string;
}

export const scalingRecommendations: ScalingRec[] = [
  { id: 's1', resource: 'us-east-1 / web-tier', action: 'scale-up', urgency: 'critical', from: 6, to: 9, reason: 'Predicted load +38% in next 12 min', eta: 'immediate' },
  { id: 's2', resource: 'eu-west-1 / api-tier', action: 'scale-up', urgency: 'high', from: 4, to: 6, reason: 'Sustained request growth +22%', eta: '5 min' },
  { id: 's3', resource: 'ap-southeast-2 / workers', action: 'scale-down', urgency: 'medium', from: 8, to: 5, reason: 'Queue depth below threshold for 18 min', eta: '12 min' },
  { id: 's4', resource: 'us-west-2 / batch', action: 'hold', urgency: 'low', from: 3, to: 3, reason: 'Utilization within optimal band', eta: 'monitoring' },
];

export interface DecisionRow {
  id: string;
  time: string;
  resource: string;
  action: string;
  result: string;
}

export const decisionHistory: DecisionRow[] = [
  { id: 'd1', time: '14:32', resource: 'us-east-1 / web-tier', action: 'Scale up 6 → 9', result: 'Latency ↓ 42%' },
  { id: 'd2', time: '13:58', resource: 'eu-west-1 / api-tier', action: 'Scale up 4 → 6', result: 'p99 ↓ 180ms' },
  { id: 'd3', time: '12:41', resource: 'ap-southeast-2 / workers', action: 'Scale down 8 → 5', result: 'Cost saved $48' },
  { id: 'd4', time: '11:20', resource: 'us-west-2 / batch', action: 'Hold at 3', result: 'Stable' },
  { id: 'd5', time: '10:05', resource: 'us-east-1 / web-tier', action: 'Scale down 9 → 6', result: 'Cost saved $96' },
];

export const costCards = {
  traditional: { monthly: 18420, label: 'Traditional Cost', hint: 'Reactive static provisioning' },
  ml: { monthly: 12780, label: 'ML-Optimized Cost', hint: 'Predictive auto-scaling' },
  savings: { monthly: 5640, label: 'Monthly Savings', hint: '30.6% reduction vs traditional' },
  projected: { monthly: 67680, label: 'Projected Annual Savings', hint: 'At current optimization rate' },
};

export const costOverTime = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
  traditional: [18200, 18500, 18900, 19100, 18800, 18600, 18420],
  ml: [14200, 13800, 13500, 13100, 12900, 12800, 12780],
};

export const resourceBreakdown = [
  { label: 'Compute (EC2)', value: 6240, color: '#6366F1' },
  { label: 'Memory (RDS)', value: 3120, color: '#06B6D4' },
  { label: 'Storage (S3)', value: 1840, color: '#A855F7' },
  { label: 'Network', value: 980, color: '#3B82F6' },
  { label: 'Other', value: 600, color: '#64748B' },
];

export const rightSizing = [
  { id: 'r1', instance: 'i-0a1b2c (m5.2xlarge)', recommendation: 'Downsize to m5.large', saving: 312, confidence: 92 },
  { id: 'r2', instance: 'i-3d4e5f (c5.4xlarge)', recommendation: 'Downsize to c5.2xlarge', saving: 488, confidence: 88 },
  { id: 'r3', instance: 'i-6g7h8i (r5.xlarge)', recommendation: 'Right-sized', saving: 0, confidence: 96 },
];

export const comparisonMetrics = [
  { metric: 'Avg Response Latency', traditional: '420 ms', ml: '180 ms', improvement: '57% faster' },
  { metric: 'Monthly Cost', traditional: '$18,420', ml: '$12,780', improvement: '30.6% lower' },
  { metric: 'Scaling Reaction Time', traditional: '8.5 min', ml: '45 sec', improvement: '91% faster' },
  { metric: 'Over-provisioning', traditional: '34%', ml: '6%', improvement: '82% reduction' },
  { metric: 'Anomaly Detection', traditional: 'Manual', ml: 'Real-time', improvement: 'Automated' },
  { metric: 'Resource Utilization', traditional: '54%', ml: '81%', improvement: '50% higher' },
];

export const comparisonChart = {
  labels: ['Latency', 'Cost', 'Reaction', 'Utilization', 'Efficiency', 'Stability'],
  traditional: [62, 78, 30, 54, 58, 70],
  ml: [88, 92, 95, 81, 90, 94],
};

export const modelMetrics = {
  accuracy: 94.2,
  mae: 2.14,
  rmse: 3.07,
  r2: 0.918,
};

export const trainingProgress = {
  labels: Array.from({ length: 40 }, (_, i) => i),
  loss: [0.92, 0.78, 0.65, 0.54, 0.46, 0.4, 0.35, 0.31, 0.28, 0.26, 0.24, 0.22, 0.21, 0.2, 0.19, 0.185, 0.18, 0.176, 0.173, 0.17, 0.168, 0.166, 0.165, 0.163, 0.162, 0.161, 0.16, 0.159, 0.158, 0.157, 0.156, 0.155, 0.154, 0.153, 0.152, 0.151, 0.15, 0.149, 0.148, 0.147],
  valLoss: [0.94, 0.82, 0.7, 0.6, 0.52, 0.46, 0.41, 0.37, 0.34, 0.32, 0.3, 0.29, 0.28, 0.27, 0.265, 0.26, 0.255, 0.251, 0.248, 0.245, 0.243, 0.241, 0.24, 0.239, 0.238, 0.237, 0.236, 0.235, 0.234, 0.233, 0.232, 0.231, 0.23, 0.229, 0.228, 0.227, 0.226, 0.225, 0.224, 0.223],
};

export const featureImportance = [
  { feature: 'Historical CPU (t-1)', importance: 0.92 },
  { feature: 'Request rate trend', importance: 0.84 },
  { feature: 'Time of day', importance: 0.71 },
  { feature: 'Memory utilization', importance: 0.63 },
  { feature: 'Day of week', importance: 0.48 },
  { feature: 'Network throughput', importance: 0.39 },
  { feature: 'Queue depth', importance: 0.31 },
  { feature: 'Error rate', importance: 0.22 },
];

export const topologyNodes = [
  { id: 'n1', label: 'us-east-1', x: 25, y: 30, type: 'region' },
  { id: 'n2', label: 'us-west-2', x: 70, y: 25, type: 'region' },
  { id: 'n3', label: 'eu-west-1', x: 30, y: 70, type: 'region' },
  { id: 'n4', label: 'ap-southeast-2', x: 75, y: 72, type: 'region' },
  { id: 'n5', label: 'web-tier', x: 50, y: 50, type: 'core' },
];

export const heatmapRows = Array.from({ length: 8 }, (_, r) =>
  Array.from({ length: 24 }, (_, c) => {
    const peak = Math.sin((c / 24) * Math.PI * 2 + r * 0.3) * 0.5 + 0.5;
    return Math.round((peak * 0.7 + Math.random() * 0.3) * 100);
  }),
);

export const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
  { id: 'resources', label: 'Resources', icon: 'Cloud' },
  { id: 'predictions', label: 'Predictions', icon: 'Sparkles' },
  { id: 'cost', label: 'Cost Optimization', icon: 'DollarSign' },
  { id: 'scaling', label: 'Scaling Recommendations', icon: 'GitBranch' },
  { id: 'comparison', label: 'Comparison', icon: 'Columns2' },
  { id: 'monitoring', label: 'System Monitoring', icon: 'Activity' },
  { id: 'models', label: 'Model Analytics', icon: 'BrainCircuit' },
  { id: 'explainable', label: 'Explainable AI', icon: 'Lightbulb' },
  { id: 'settings', label: 'Settings', icon: 'Settings' },
  { id: 'about', label: 'About', icon: 'Info' },
] as const;

export type NavId = (typeof navItems)[number]['id'];
