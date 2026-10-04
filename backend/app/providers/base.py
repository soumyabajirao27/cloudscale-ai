"""Cloud provider abstraction layer.

Defines the provider-agnostic interface that CloudScale uses to obtain
cloud resource information from external providers (AWS, GCP, Azure, mock).

The provider layer MUST NOT depend on FastAPI. It only uses standard library
types and Pydantic models.
"""

from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from datetime import datetime, timezone


@dataclass(frozen=True)
class ProviderResource:
    """A cloud resource as reported by an external provider.

    Attributes:
        provider_resource_id: Provider-specific unique identifier (e.g. AWS instance ID).
        name: Human-readable resource name.
        provider: Provider key (e.g. "mock", "aws", "gcp", "azure").
        region: Deployment region (e.g. "us-east-1").
        resource_type: Resource type (e.g. "ec2", "vm", "compute").
        cpu_utilization: Current CPU utilization percentage (0-100).
        memory_utilization: Current memory utilization percentage (0-100).
        storage_utilization: Current storage utilization percentage (0-100).
        network_utilization: Current network utilization percentage (0-100).
        capacity: Resource capacity (e.g. vCPUs, instance count).
        estimated_cost: Estimated monthly cost in USD.
    """

    provider_resource_id: str
    name: str
    provider: str
    region: str
    resource_type: str
    cpu_utilization: float
    memory_utilization: float
    storage_utilization: float = 0.0
    network_utilization: float = 0.0
    capacity: float = 1.0
    estimated_cost: float = 0.0


@dataclass(frozen=True)
class ProviderMetric:
    """A single utilization metric sample from a provider."""

    cpu_utilization: float
    memory_utilization: float
    storage_utilization: float = 0.0
    network_utilization: float = 0.0
    timestamp: datetime = field(default_factory=lambda: datetime.now(timezone.utc))


class BaseCloudProvider(ABC):
    """Abstract interface for cloud providers.

    Concrete providers must implement these methods. The provider layer
    must remain independent of FastAPI and the database.
    """

    #: Human-readable provider key (e.g. "mock", "aws").
    provider_name: str = "base"

    @abstractmethod
    def list_resources(self) -> list[ProviderResource]:
        """Return all discoverable resources from this provider."""
        raise NotImplementedError

    @abstractmethod
    def get_resource(self, provider_resource_id: str) -> ProviderResource | None:
        """Return a single resource by its provider-specific ID, or None."""
        raise NotImplementedError

    @abstractmethod
    def get_metrics(self, provider_resource_id: str) -> list[ProviderMetric]:
        """Return recent utilization metrics for a resource.

        May return an empty list if the provider does not expose metrics.
        """
        raise NotImplementedError
