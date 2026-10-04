import { resourceService } from './resourceService';
import { ScalingRecommendation, CostOptimizationItem } from '../types/cloudscaler';

export const optimizationService = {
  // Returns scaling recommendations dynamically calculated based on live resource metrics
  async getScalingRecommendations(): Promise<ScalingRecommendation[]> {
    try {
      const resources = await resourceService.getResources();
      return resources.map((r, index) => {
        const id = `rec-${index + 1}`;
        if (r.status === 'OVERLOADED') {
          return {
            id,
            resourceId: r.id,
            resourceName: r.name,
            currentStatus: 'OVERLOADED' as const,
            cpuUtilization: r.cpu,
            memoryUtilization: r.memory,
            recommendation: `Scale Up Instance Capacity (Increase from ${r.capacity} to ${r.capacity * 2} Units)`,
            reason: `Current utilization (${r.cpu}% CPU, ${r.memory}% Memory) exceeds the configured safe operating threshold of 80%.`,
            priority: 'HIGH' as const,
            impact: {
              performance: 'INCREASE' as const,
              availability: 'INCREASE' as const,
              cost: 'INCREASE' as const,
            },
            estimatedCostChange: Math.round(r.monthlyCost),
          };
        } else if (r.status === 'UNDERUTILIZED') {
          return {
            id,
            resourceId: r.id,
            resourceName: r.name,
            currentStatus: 'UNDERUTILIZED' as const,
            cpuUtilization: r.cpu,
            memoryUtilization: r.memory,
            recommendation: `Downsize Capacity / Right-Size VM (Decrease from ${r.capacity} Unit to Micro Tier)`,
            reason: `Average CPU utilization (${r.cpu}%) and Memory utilization (${r.memory}%) has remained under 20%, indicating over-provisioned infrastructure.`,
            priority: 'LOW' as const,
            impact: {
              performance: 'OPTIMIZE' as const,
              availability: 'STABLE' as const,
              cost: 'DECREASE' as const,
            },
            estimatedCostChange: -Math.round(r.monthlyCost * 0.4),
          };
        } else {
          return {
            id,
            resourceId: r.id,
            resourceName: r.name,
            currentStatus: 'OPTIMAL' as const,
            cpuUtilization: r.cpu,
            memoryUtilization: r.memory,
            recommendation: `Maintain Provisioned Capacity (${r.capacity} Units)`,
            reason: `Resource performance metrics show healthy utilization headroom within target SLO parameters (20-80%).`,
            priority: 'MEDIUM' as const,
            impact: {
              performance: 'MAINTAIN' as const,
              availability: 'STABLE' as const,
              cost: 'NEUTRAL' as const,
            },
            estimatedCostChange: 0,
          };
        }
      });
    } catch (err: any) {
      if (err.message === 'MOCK_MODE_ACTIVE') {
        throw err;
      }
      return [];
    }
  },

  // Returns right-sizing and FinOps cost details dynamically calculated from live resource list
  async getCostOptimization(): Promise<{ items: CostOptimizationItem[]; totals: any }> {
    try {
      const resources = await resourceService.getResources();
      let totalCost = 0;
      let totalCapacity = 0;
      let potentialSavings = 0;

      const items = resources.map((r) => {
        totalCost += r.monthlyCost;
        totalCapacity += r.capacity;

        let recommendedSize = `Current (${r.capacity} Units)`;
        let estimatedCost = r.monthlyCost;
        let itemSavings = 0;
        let recommendation = 'Right-sized — no cost action needed';

        if (r.status === 'OVERLOADED') {
          recommendedSize = `Upgrade Capacity (${r.capacity * 2} Units)`;
          estimatedCost = Math.round(r.monthlyCost * 1.5);
          recommendation = 'Scaling required for performance reliability';
        } else if (r.status === 'UNDERUTILIZED') {
          recommendedSize = 'Downsized Tier (t3.micro)';
          estimatedCost = Math.round(r.monthlyCost * 0.6);
          itemSavings = Math.round(r.monthlyCost * 0.4);
          potentialSavings += itemSavings;
          recommendation = 'Right-size instance tier to eliminate idle capacity';
        }

        return {
          resourceId: r.id,
          resourceName: r.name,
          currentUtilization: { cpu: r.cpu, memory: r.memory },
          currentCost: r.monthlyCost,
          recommendedSize,
          estimatedCost,
          potentialSavings: itemSavings,
          recommendation,
          confidence: 'High' as const,
        };
      });

      return {
        items,
        totals: {
          totalResources: resources.length,
          totalMonthlyCost: totalCost,
          totalCapacity,
          potentialSavings,
          systemHealth: resources.some((r) => r.status === 'OVERLOADED')
            ? 'Action Required (High Load)'
            : 'Healthy',
        },
      };
    } catch (err: any) {
      if (err.message === 'MOCK_MODE_ACTIVE') {
        throw err;
      }
      return {
        items: [],
        totals: {
          totalResources: 0,
          totalMonthlyCost: 0,
          totalCapacity: 0,
          potentialSavings: 0,
          systemHealth: 'Offline',
        },
      };
    }
  },
};
