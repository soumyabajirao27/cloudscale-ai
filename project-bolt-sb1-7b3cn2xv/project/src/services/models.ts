import api from '@/lib/api';

/** Exact response contract for backend TrainingResult (see backend/app/schemas/metric.py). */
export interface TrainingResult {
  status: string;
  samples_used: number;
  mae: number | null;
  rmse: number | null;
  r2: number | null;
  model_version: string | null;
  message: string;
}

/**
 * Triggers ML model training (RandomForestRegressor) on the backend.
 * JWT is supplied automatically by the existing Axios request interceptor.
 */
export async function trainModel(): Promise<TrainingResult> {
  const { data } = await api.post<TrainingResult>('/resources/model/train');
  return data;
}
