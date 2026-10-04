"""CloudScale AI Optimization Engine Abstraction.

Provides a clean interface boundary for AI/ML optimization engines.
Includes a deterministic baseline rule-based analyzer that can be replaced
by a trained Machine Learning model in future phases without altering API contracts.
"""

from abc import ABC, abstractmethod

from app.models.metric import ResourceMetric
from app.models.resource import CloudResource
from app.schemas.optimization import (
    AnalysisSource,
    CurrentUtilization,
    EstimatedImpact,
    OptimizationAnalysis,
    UtilizationStatus,
)


class BaseOptimizationEngine(ABC):
    """Abstract base class interface for CloudScale AI optimization engines."""

    @abstractmethod
    def analyze_resource(
        self,
        resource: CloudResource,
        metrics: list[ResourceMetric] | None = None,
    ) -> OptimizationAnalysis:
        """Analyze cloud resource metrics and produce a structured optimization report."""
        pass


class BaselineRuleEngine(BaseOptimizationEngine):
    """Deterministic baseline rule-based optimization engine.

    Note: This is a rule-based baseline threshold analyzer used as a foundation
    prior to integrating trained Machine Learning models in subsequent phases.
    """

    def analyze_resource(
        self,
        resource: CloudResource,
        metrics: list[ResourceMetric] | None = None,
    ) -> OptimizationAnalysis:
        cpu = resource.cpu_utilization
        memory = resource.memory_utilization
        storage = resource.storage_utilization
        network = resource.network_utilization
        cost = resource.estimated_cost

        current_util = CurrentUtilization(
            cpu=cpu,
            memory=memory,
            storage=storage,
            network=network,
        )

        # Baseline threshold logic
        if cpu > 85.0 or memory > 85.0:
            status = UtilizationStatus.OVERLOADED
            recommendation = (
                f"Resource '{resource.name}' is experiencing high load (CPU: {cpu:.1f}%, Memory: {memory:.1f}%). "
                "Consider upgrading instance capacity or scaling out to prevent service degradation."
            )
            suggested_action = "Increase instance size or add auto-scaling replica nodes."
            impact = EstimatedImpact(
                cost_change_percentage=25.0,
                estimated_monthly_savings=0.0,
                performance_impact="Prevents potential latency spikes and system degradation under heavy load.",
            )
            confidence = 0.90
        elif cpu < 20.0 and memory < 20.0:
            status = UtilizationStatus.UNDERUTILIZED
            estimated_savings = round(cost * 0.40, 2)
            recommendation = (
                f"Resource '{resource.name}' is underutilized (CPU: {cpu:.1f}%, Memory: {memory:.1f}%). "
                "Downsizing or consolidating workloads can achieve significant cost savings."
            )
            suggested_action = "Downsize to a smaller instance tier or schedule idle-time shutdown."
            impact = EstimatedImpact(
                cost_change_percentage=-40.0,
                estimated_monthly_savings=estimated_savings,
                performance_impact="Minimal performance impact expected for low-demand workload.",
            )
            confidence = 0.88
        else:
            status = UtilizationStatus.OPTIMAL
            recommendation = (
                f"Resource '{resource.name}' is operating within optimal capacity parameters (CPU: {cpu:.1f}%, Memory: {memory:.1f}%)."
            )
            suggested_action = "Maintain current resource provisioning and monitor usage trends."
            impact = EstimatedImpact(
                cost_change_percentage=0.0,
                estimated_monthly_savings=0.0,
                performance_impact="Stable performance maintained with current capacity.",
            )
            confidence = 0.95

        return OptimizationAnalysis(
            resource_id=resource.id,
            resource_name=resource.name,
            status=status,
            recommendation=recommendation,
            current_utilization=current_util,
            suggested_action=suggested_action,
            estimated_impact=impact,
            confidence_score=confidence,
            analysis_source=AnalysisSource.BASELINE,
        )


class OptimizationService:
    """Service layer delegating analysis to the configured optimization engine."""

    def __init__(self, engine: BaseOptimizationEngine | None = None) -> None:
        self.engine = engine or BaselineRuleEngine()

    def analyze(
        self,
        resource: CloudResource,
        metrics: list[ResourceMetric] | None = None,
    ) -> OptimizationAnalysis:
        """Run optimization analysis on a cloud resource.

        Args:
            resource: The cloud resource being analyzed.
            metrics: Optional chronological historical metric samples that
                ML-backed engines may use for demand prediction.
        """
        return self.engine.analyze_resource(resource, metrics)
