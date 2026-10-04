"""ML-based optimization engine with baseline fallback.

Tries to produce an optimization analysis backed by the trained
``RandomForestRegressor`` demand prediction model. If the model is
unavailable or prediction cannot be completed (missing artifact,
insufficient data, feature preparation failure), it transparently
falls back to the deterministic :class:`BaselineRuleEngine`.

The response always indicates which engine produced the analysis via
``analysis_source`` (``ml_prediction`` or ``baseline``) so callers are
never misled about the provenance of a recommendation.
"""

from __future__ import annotations

from app.ml.predictor import ModelNotAvailableError, PredictionService
from app.models.metric import ResourceMetric
from app.models.resource import CloudResource
from app.schemas.optimization import (
    AnalysisSource,
    CurrentUtilization,
    EstimatedImpact,
    OptimizationAnalysis,
    UtilizationStatus,
)
from app.services.optimization import BaseOptimizationEngine, BaselineRuleEngine

# Fewer metric samples than this cannot form a reliable prediction.
MIN_METRICS_FOR_PREDICTION = 3


class MLOptimizationEngine(BaseOptimizationEngine):
    """Optimization engine combining ML demand prediction with baseline fallback."""

    def __init__(
        self,
        prediction_service: PredictionService | None = None,
        baseline_engine: BaselineRuleEngine | None = None,
    ) -> None:
        self.prediction_service = prediction_service or PredictionService()
        self.baseline_engine = baseline_engine or BaselineRuleEngine()

    def analyze_resource(
        self,
        resource: CloudResource,
        metrics: list[ResourceMetric] | None = None,
    ) -> OptimizationAnalysis:
        """Produce an optimization analysis, preferring ML-backed prediction.

        Args:
            resource: The cloud resource being analyzed.
            metrics: Optional chronological historical metric samples.

        Returns:
            An ``OptimizationAnalysis`` whose ``analysis_source`` is
            ``ml_prediction`` when a real prediction succeeded, otherwise
            ``baseline``.
        """
        if metrics and len(metrics) >= MIN_METRICS_FOR_PREDICTION:
            try:
                predicted_cpu = self.prediction_service.predict_cpu_utilization(metrics)
                return self._build_ml_analysis(resource=resource, predicted_cpu=predicted_cpu)
            except (ModelNotAvailableError, ValueError):
                # Model missing/corrupted or features could not be prepared;
                # fall through to the deterministic baseline engine.
                pass

        return self.baseline_engine.analyze_resource(resource)

    def _build_ml_analysis(
        self,
        resource: CloudResource,
        predicted_cpu: float,
    ) -> OptimizationAnalysis:
        """Build a structured optimization analysis from an ML prediction."""
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

        if predicted_cpu > 85.0:
            status = UtilizationStatus.OVERLOADED
            recommendation = (
                f"Resource '{resource.name}' is projected to reach high load "
                f"(predicted CPU: {predicted_cpu:.1f}%). "
                "Consider upgrading capacity before degradation occurs."
            )
            suggested_action = "Increase capacity or add auto-scaling replicas based on ML demand forecast."
            impact = EstimatedImpact(
                cost_change_percentage=25.0,
                estimated_monthly_savings=0.0,
                performance_impact="Prevents predicted latency spikes and service degradation.",
            )
            confidence = 0.92
        elif predicted_cpu < 20.0 and memory < 20.0:
            status = UtilizationStatus.UNDERUTILIZED
            estimated_savings = round(cost * 0.40, 2)
            recommendation = (
                f"Resource '{resource.name}' is projected to remain underutilized "
                f"(predicted CPU: {predicted_cpu:.1f}%). "
                "Downsizing or consolidating workloads can achieve significant cost savings."
            )
            suggested_action = "Downsize to a smaller instance tier based on ML demand forecast."
            impact = EstimatedImpact(
                cost_change_percentage=-40.0,
                estimated_monthly_savings=estimated_savings,
                performance_impact="Minimal performance impact expected for low-demand workload.",
            )
            confidence = 0.90
        else:
            status = UtilizationStatus.OPTIMAL
            recommendation = (
                f"Resource '{resource.name}' is projected to operate within optimal capacity "
                f"(predicted CPU: {predicted_cpu:.1f}%)."
            )
            suggested_action = "Maintain current resource provisioning based on ML demand forecast."
            impact = EstimatedImpact(
                cost_change_percentage=0.0,
                estimated_monthly_savings=0.0,
                performance_impact="Stable performance maintained with current capacity.",
            )
            confidence = 0.93

        return OptimizationAnalysis(
            resource_id=resource.id,
            resource_name=resource.name,
            status=status,
            recommendation=recommendation,
            current_utilization=current_util,
            suggested_action=suggested_action,
            estimated_impact=impact,
            confidence_score=confidence,
            analysis_source=AnalysisSource.ML_PREDICTION,
            predicted_cpu_utilization=round(predicted_cpu, 2),
        )
