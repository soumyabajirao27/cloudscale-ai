"""Optimization AI analysis schemas (Pydantic v2).

Defines structured response models for CloudScale AI optimization engine.
"""

from enum import Enum
from pydantic import Field

from app.schemas.base import ORMModel


class UtilizationStatus(str, Enum):
    """Classification status for resource utilization."""

    UNDERUTILIZED = "UNDERUTILIZED"
    OPTIMAL = "OPTIMAL"
    OVERLOADED = "OVERLOADED"


class CurrentUtilization(ORMModel):
    """Summary of utilization metrics for analysis."""

    cpu: float = Field(..., description="CPU utilization percentage")
    memory: float = Field(..., description="Memory utilization percentage")
    storage: float = Field(..., description="Storage utilization percentage")
    network: float = Field(..., description="Network utilization percentage")


class EstimatedImpact(ORMModel):
    """Estimated financial and performance impact of optimization."""

    cost_change_percentage: float = Field(..., description="Estimated percentage change in cost (negative = savings)")
    estimated_monthly_savings: float = Field(..., description="Estimated monthly savings in USD")
    performance_impact: str = Field(..., description="Description of expected performance impact")


class AnalysisSource(str, Enum):
    """Indicates which engine produced the optimization analysis."""

    ML_PREDICTION = "ml_prediction"
    BASELINE = "baseline"


class OptimizationAnalysis(ORMModel):
    """Structured AI optimization result for a cloud resource."""

    resource_id: int = Field(..., description="ID of the analyzed resource")
    resource_name: str = Field(..., description="Name of the analyzed resource")
    status: UtilizationStatus = Field(..., description="Resource utilization status classification")
    recommendation: str = Field(..., description="Actionable optimization recommendation")
    current_utilization: CurrentUtilization = Field(..., description="Current resource utilization breakdown")
    suggested_action: str = Field(..., description="Specific recommended scaling or tuning action")
    estimated_impact: EstimatedImpact = Field(..., description="Estimated cost and performance impact")
    confidence_score: float = Field(..., ge=0.0, le=1.0, description="Confidence score of analysis (0.0 to 1.0)")
    analysis_source: AnalysisSource = Field(
        default=AnalysisSource.BASELINE,
        description="Engine that produced this analysis (ml_prediction or baseline)",
    )
    predicted_cpu_utilization: float | None = Field(
        default=None,
        description="Predicted future CPU utilization percentage (only when ML prediction is used)",
    )


__all__ = [
    "UtilizationStatus",
    "CurrentUtilization",
    "EstimatedImpact",
    "OptimizationAnalysis",
    "AnalysisSource",
]
