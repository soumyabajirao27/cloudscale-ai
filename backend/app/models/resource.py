"""Cloud Resource ORM model.

Represents a cloud resource or workload analyzed by CloudScale AI.
Inherits shared ``BaseModel`` columns (``id``, ``created_at``, ``updated_at``).
"""

from sqlalchemy import Float, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import BaseModel


class CloudResource(BaseModel):
    """Cloud resource or workload instance.

    Attributes:
        user_id: Foreign key to the owner account in ``users``.
        name: Human-readable resource identifier.
        provider_type: Cloud provider or workload type (e.g. AWS EC2, GCP Compute).
        region: Deployment region (e.g. us-east-1).
        cpu_utilization: Percentage CPU usage (0.0 to 100.0).
        memory_utilization: Percentage Memory usage (0.0 to 100.0).
        storage_utilization: Percentage Storage usage (0.0 to 100.0).
        network_utilization: Percentage Network usage (0.0 to 100.0).
        current_capacity: Capacity metric (e.g., vCPUs, node count).
        estimated_cost: Current estimated monthly cost in USD.
    """

    __tablename__ = "cloud_resources"

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    provider_resource_id: Mapped[str] = mapped_column(
        String(100),
        nullable=True,
        index=True,
    )
    name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )
    provider_type: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )
    region: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )
    cpu_utilization: Mapped[float] = mapped_column(
        Float,
        nullable=False,
    )
    memory_utilization: Mapped[float] = mapped_column(
        Float,
        nullable=False,
    )
    storage_utilization: Mapped[float] = mapped_column(
        Float,
        default=0.0,
        nullable=False,
    )
    network_utilization: Mapped[float] = mapped_column(
        Float,
        default=0.0,
        nullable=False,
    )
    current_capacity: Mapped[float] = mapped_column(
        Float,
        default=1.0,
        nullable=False,
    )
    estimated_cost: Mapped[float] = mapped_column(
        Float,
        default=0.0,
        nullable=False,
    )
