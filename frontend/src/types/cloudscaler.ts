export type ResourceStatus = 'UNDERUTILIZED' | 'OPTIMAL' | 'OVERLOADED';

export type PriorityLevel = 'HIGH' | 'MEDIUM' | 'LOW';

export interface CloudResource {
  id: string;
  name: string;
  provider: string;
  region: string;
  capacity: number;
  cpu: number; // Percentage
  memory: number; // Percentage
  storage: number; // Percentage
  network: number; // Percentage
  monthlyCost: number; // USD
  status: ResourceStatus;
  lastUpdated: string;
  tags?: Record<string, string>;
}

export interface MetricPoint {
  timestamp: string;
  cpu: number;
  memory: number;
  storage?: number;
  network?: number;
  predictedCpu?: number;
  upperBoundCpu?: number;
  lowerBoundCpu?: number;
}

export interface PredictionSummary {
  resourceId: string;
  currentCpu: number;
  predictedCpu: number;
  confidence: number; // e.g. 0.94 -> 94%
  horizonHours: number;
  modelVersion: string;
  status: ResourceStatus;
  suggestedAction: string;
  metrics: MetricPoint[];
}

export interface ScalingRecommendation {
  id: string;
  resourceId: string;
  resourceName: string;
  currentStatus: ResourceStatus;
  cpuUtilization: number;
  memoryUtilization: number;
  recommendation: string;
  reason: string;
  priority: PriorityLevel;
  impact: {
    performance: 'INCREASE' | 'MAINTAIN' | 'OPTIMIZE';
    availability: 'INCREASE' | 'STABLE';
    cost: 'INCREASE' | 'DECREASE' | 'NEUTRAL';
  };
  estimatedCostChange?: number; // +/- dollar amount
}

export interface CostOptimizationItem {
  resourceId: string;
  resourceName: string;
  currentUtilization: {
    cpu: number;
    memory: number;
  };
  currentCost: number;
  recommendedSize: string;
  estimatedCost: number;
  potentialSavings: number;
  recommendation: string;
  confidence: 'High' | 'Medium' | 'Low';
}

export interface FeatureContribution {
  feature: string;
  weight: number; // percentage or impact ratio
  value: string | number;
  impact: 'High Risk' | 'Normal' | 'Under-capacity' | 'Neutral';
}

export interface ReasoningStep {
  step: number;
  stage: string;
  label: string;
  description: string;
  value: string;
}

export interface ExplainableAIDecision {
  resourceId: string;
  resourceName: string;
  classifiedStatus: ResourceStatus;
  recommendation: string;
  confidenceScore: number;
  primaryDrivers: FeatureContribution[];
  reasoningPath: ReasoningStep[];
}

export interface ModelAnalyticsData {
  modelVersion: string;
  activeStatus: string;
  predictionAccuracy: number;
  mae: number;
  rmse: number;
  trainingSamples: number;
  lastTrained: string;
  pipelineStages: {
    id: number;
    title: string;
    description: string;
    iconName: string;
  }[];
}

export interface SystemEvent {
  id: string;
  timestamp: string;
  type: 'ANALYSIS' | 'PREDICTION' | 'UTILIZATION' | 'RECOMMENDATION';
  title: string;
  description: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL' | 'SUCCESS';
  resourceId?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: {
    email: string;
    name: string;
    role: string;
  } | null;
  token: string | null;
}
