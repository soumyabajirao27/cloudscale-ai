import { fetchApi } from './apiClient';
import { DEMO_SCALING_RECOMMENDATIONS, DEMO_COST_OPTIMIZATION, DEMO_TOTALS } from './mockData';
import { ScalingRecommendation, CostOptimizationItem } from '../types/cloudscaler';

export const optimizationService = {
  async getScalingRecommendations(): Promise<ScalingRecommendation[]> {
    try {
      return await fetchApi<ScalingRecommendation[]>('/api/v1/recommendations');
    } catch {
      return DEMO_SCALING_RECOMMENDATIONS;
    }
  },

  async getCostOptimization(): Promise<{ items: CostOptimizationItem[]; totals: typeof DEMO_TOTALS }> {
    try {
      return await fetchApi<{ items: CostOptimizationItem[]; totals: typeof DEMO_TOTALS }>('/api/v1/cost/optimization');
    } catch {
      return {
        items: DEMO_COST_OPTIMIZATION,
        totals: DEMO_TOTALS
      };
    }
  }
};
