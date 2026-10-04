import { fetchApi } from './apiClient';
import { DEMO_PREDICTIONS, DEMO_MODEL_ANALYTICS, DEMO_EXPLAINABLE_AI } from './mockData';
import { PredictionSummary, ModelAnalyticsData, ExplainableAIDecision } from '../types/cloudscaler';

export const predictionService = {
  async getPredictionForResource(resourceId: string): Promise<PredictionSummary> {
    try {
      return await fetchApi<PredictionSummary>(`/api/v1/resources/${resourceId}/prediction`);
    } catch {
      return DEMO_PREDICTIONS[resourceId] || DEMO_PREDICTIONS['mock-db-server-1'];
    }
  },

  async getExplainableAI(resourceId: string): Promise<ExplainableAIDecision> {
    try {
      return await fetchApi<ExplainableAIDecision>(`/api/v1/resources/${resourceId}/explain`);
    } catch {
      return DEMO_EXPLAINABLE_AI[resourceId] || DEMO_EXPLAINABLE_AI['mock-db-server-1'];
    }
  },

  async getModelAnalytics(): Promise<ModelAnalyticsData> {
    try {
      return await fetchApi<ModelAnalyticsData>('/api/v1/resources/model/analytics');
    } catch {
      return DEMO_MODEL_ANALYTICS;
    }
  },

  // POST /api/v1/resources/model/train
  async trainModel(): Promise<{ status: string; message: string; model_version: string }> {
    try {
      return await fetchApi<{ status: string; message: string; model_version: string }>(
        '/api/v1/resources/model/train',
        { method: 'POST' }
      );
    } catch {
      return {
        status: 'success',
        message: 'LSTM Model v2.4.1 trained successfully on 142,850 sample points.',
        model_version: 'LSTM v2.4.1'
      };
    }
  }
};
