"""Deterministic mock cloud provider for development and testing.

Returns a fixed set of cloud resources so the application works out of the
box without real cloud credentials. All values are stable (no randomness),
making tests reliable.
"""

from __future__ import annotations

from app.providers.base import BaseCloudProvider, ProviderMetric, ProviderResource

# Deterministic mock dataset — values never change between calls.
_MOCK_RESOURCES: list[ProviderResource] = [
    ProviderResource(
        provider_resource_id="mock-ec2-web-001",
        name="mock-web-server-1",
        provider="mock",
        region="us-east-1",
        resource_type="ec2",
        cpu_utilization=45.0,
        memory_utilization=50.0,
        storage_utilization=30.0,
        network_utilization=20.0,
        capacity=2.0,
        estimated_cost=120.0,
    ),
    ProviderResource(
        provider_resource_id="mock-ec2-db-002",
        name="mock-db-server-1",
        provider="mock",
        region="us-east-1",
        resource_type="ec2",
        cpu_utilization=92.0,
        memory_utilization=90.0,
        storage_utilization=65.0,
        network_utilization=35.0,
        capacity=4.0,
        estimated_cost=300.0,
    ),
    ProviderResource(
        provider_resource_id="mock-gcp-vm-003",
        name="mock-app-vm-1",
        provider="mock",
        region="us-central1",
        resource_type="gce",
        cpu_utilization=10.0,
        memory_utilization=10.0,
        storage_utilization=10.0,
        network_utilization=5.0,
        capacity=1.0,
        estimated_cost=45.0,
    ),
]

# Deterministic mock metric samples (one per resource).
_MOCK_METRICS: dict[str, list[ProviderMetric]] = {
    "mock-ec2-web-001": [
        ProviderMetric(cpu_utilization=40.0, memory_utilization=45.0, storage_utilization=28.0, network_utilization=18.0),
        ProviderMetric(cpu_utilization=45.0, memory_utilization=50.0, storage_utilization=30.0, network_utilization=20.0),
    ],
    "mock-ec2-db-002": [
        ProviderMetric(cpu_utilization=88.0, memory_utilization=86.0, storage_utilization=60.0, network_utilization=30.0),
        ProviderMetric(cpu_utilization=92.0, memory_utilization=90.0, storage_utilization=65.0, network_utilization=35.0),
    ],
    "mock-gcp-vm-003": [
        ProviderMetric(cpu_utilization=8.0, memory_utilization=8.0, storage_utilization=8.0, network_utilization=4.0),
        ProviderMetric(cpu_utilization=10.0, memory_utilization=10.0, storage_utilization=10.0, network_utilization=5.0),
    ],
}


class MockCloudProvider(BaseCloudProvider):
    """Deterministic mock provider producing stable development data.

    Mock dataset is fixed at import time; no networking, credentials, or
    randomness are involved.
    """

    provider_name: str = "mock"

    def list_resources(self) -> list[ProviderResource]:
        """Return the deterministic mock resource list."""
        return list(_MOCK_RESOURCES)

    def get_resource(self, provider_resource_id: str) -> ProviderResource | None:
        """Return a single mock resource by provider ID, or None if missing."""
        for resource in _MOCK_RESOURCES:
            if resource.provider_resource_id == provider_resource_id:
                return resource
        return None

    def get_metrics(self, provider_resource_id: str) -> list[ProviderMetric]:
        """Return deterministic mock metrics for a resource ID."""
        return list(_MOCK_METRICS.get(provider_resource_id, []))
