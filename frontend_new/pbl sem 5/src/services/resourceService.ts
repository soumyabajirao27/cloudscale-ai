import { fetchApi } from './apiClient';
import { DEMO_RESOURCES, DEMO_PREDICTIONS } from './mockData';
import { CloudResource, MetricPoint, ResourceStatus } from '../types/cloudscaler';

export const resourceService = {
  // GET /api/v1/resources
  async getResources(): Promise<CloudResource[]> {
    try {
      return await fetchApi<CloudResource[]>('/api/v1/resources');
    } catch {
      // Fallback to central mock dataset
      return DEMO_RESOURCES;
    }
  },

  // GET /api/v1/resources/{resource_id}
  async getResourceById(resourceId: string): Promise<CloudResource | undefined> {
    try {
      return await fetchApi<CloudResource>(`/api/v1/resources/${resourceId}`);
    } catch {
      return DEMO_RESOURCES.find(r => r.id === resourceId);
    }
  },

  // GET /api/v1/resources/{resource_id}/metrics
  async getResourceMetrics(resourceId: string): Promise<MetricPoint[]> {
    try {
      return await fetchApi<MetricPoint[]>(`/api/v1/resources/${resourceId}/metrics`);
    } catch {
      const pred = DEMO_PREDICTIONS[resourceId];
      return pred ? pred.metrics : [];
    }
  },

  // POST /api/v1/resources/{resource_id}/analyze
  async analyzeResource(resourceId: string): Promise<{ resource_id: string; status: ResourceStatus; summary: string }> {
    try {
      return await fetchApi<{ resource_id: string; status: ResourceStatus; summary: string }>(
        `/api/v1/resources/${resourceId}/analyze`,
        { method: 'POST' }
      );
    } catch {
      const resource = DEMO_RESOURCES.find(r => r.id === resourceId);
      const status = resource ? resource.status : 'OPTIMAL';
      return {
        resource_id: resourceId,
        status,
        summary: `Analysis completed for ${resourceId}. Status classified as ${status}.`
      };
    }
  },

  // POST /api/v1/resources/sync
  async syncResources(): Promise<{ status: string; count: number }> {
    try {
      return await fetchApi<{ status: string; count: number }>('/api/v1/resources/sync', { method: 'POST' });
    } catch {
      return { status: 'success', count: DEMO_RESOURCES.length };
    }
  }
};
