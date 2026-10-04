import api from '@/lib/api';

/** Backend OptimizationAnalysis (see backend/app/schemas/optimization.py). */
export interface OptimizationAnalysis {
  resource_id: number;
  resource_name: string;
  status: 'UNDERUTILIZED' | 'OPTIMAL' | 'OVERLOADED';
  recommendation: string;
  current_utilization: {
    cpu: number;
    memory: number;
    storage: number;
    network: number;
  };
  suggested_action: string;
  estimated_impact: {
    cost_change_percentage: number;
    estimated_monthly_savings: number;
    performance_impact: string;
  };
  confidence_score: number;
  analysis_source: 'ml_prediction' | 'baseline';
  predicted_cpu_utilization: number | null;
}

/** Run AI/ML optimization analysis for a specific resource. */
export async function analyzeResource(resourceId: number): Promise<OptimizationAnalysis> {
  const { data } = await api.post<OptimizationAnalysis>(`/resources/${resourceId}/analyze`);
  return data;
}
