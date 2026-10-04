import api from '@/lib/api';

export interface Resource {
  id: number;
  user_id: number;
  name: string;
  provider_type: string;
  region: string;
  provider_resource_id: string | null;
  cpu_utilization: number;
  memory_utilization: number;
  storage_utilization: number;
  network_utilization: number;
  current_capacity: number;
  estimated_cost: number;
  created_at: string;
  updated_at: string;
}

export interface ResourceMetric {
  id: number;
  resource_id: number;
  timestamp: string;
  cpu_utilization: number;
  memory_utilization: number;
  storage_utilization: number;
  network_utilization: number;
}

/** Exact request contract for backend MetricCreate. */
export interface ResourceMetricCreate {
  timestamp?: string | null;
  cpu_utilization: number;
  memory_utilization: number;
  storage_utilization?: number;
  network_utilization?: number;
}

export interface SyncResult {
  created: number;
  updated: number;
  unchanged: number;
  provider: string;
}

export async function getResources(): Promise<Resource[]> {
  const { data } = await api.get<Resource[]>('/resources');
  return data;
}

export async function getResource(id: number): Promise<Resource> {
  const { data } = await api.get<Resource>(`/resources/${id}`);
  return data;
}

export async function syncResources(syncMetrics = true): Promise<SyncResult> {
  const { data } = await api.post<SyncResult>('/resources/sync', null, {
    params: { sync_metrics: syncMetrics },
  });
  return data;
}

export async function getResourceMetrics(id: number): Promise<ResourceMetric[]> {
  const { data } = await api.get<ResourceMetric[]>(`/resources/${id}/metrics`);
  return data;
}

export async function createResourceMetric(
  id: number,
  payload: ResourceMetricCreate,
): Promise<ResourceMetric> {
  const { data } = await api.post<ResourceMetric>(`/resources/${id}/metrics`, payload);
  return data;
}

export type ResourceCreate = Omit<Resource, 'id' | 'user_id' | 'created_at' | 'updated_at'> & {
  provider_resource_id?: string | null;
};
export type ResourceUpdate = Partial<ResourceCreate>;

export async function createResource(payload: ResourceCreate): Promise<Resource> {
  const { data } = await api.post<Resource>('/resources', payload);
  return data;
}

export async function updateResource(id: number, payload: ResourceUpdate): Promise<Resource> {
  const { data } = await api.patch<Resource>(`/resources/${id}`, payload);
  return data;
}

export async function deleteResource(id: number): Promise<void> {
  await api.delete(`/resources/${id}`);
}
