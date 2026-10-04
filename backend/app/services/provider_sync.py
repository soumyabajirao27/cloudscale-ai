"""Provider resource sync service.

Coordinates retrieving cloud resources from a provider and reconciling them
into the local ``CloudResource`` table without duplicating records.

The service depends on a :class:`BaseCloudProvider` (e.g. ``MockCloudProvider``)
and the existing repository/service layers. It does NOT talk to FastAPI.
"""

from __future__ import annotations

from dataclasses import dataclass

from sqlalchemy.orm import Session

from app.models.resource import CloudResource
from app.models.user import User
from app.providers.base import BaseCloudProvider, ProviderResource
from app.repositories.resource import ResourceRepository
from app.schemas.metric import MetricCreate
from app.services.metric import MetricService


@dataclass
class SyncResult:
    """Structured result of a resource sync operation."""

    created: int = 0
    updated: int = 0
    unchanged: int = 0
    provider: str = ""


class ProviderSyncService:
    """Service that synchronises provider resources into the local database."""

    def __init__(
        self,
        db: Session,
        provider: BaseCloudProvider,
        user: User,
    ) -> None:
        self.db = db
        self.provider = provider
        self.user = user
        self.resource_repo = ResourceRepository(db)
        self.metric_service = MetricService(db)

    def sync_resources(self, sync_metrics: bool = True) -> SyncResult:
        """Fetch provider resources and reconcile them with the database.

        Args:
            sync_metrics: Whether to also store provider-reported current metrics.

        Returns:
            A ``SyncResult`` with created/updated/unchanged counts and provider key.
        """
        provider_resources = self.provider.list_resources()
        result = SyncResult(provider=self.provider.provider_name)

        for provider_resource in provider_resources:
            existing = self._find_by_provider_id(provider_resource.provider_resource_id)

            if existing is None:
                self._create_resource(provider_resource)
                result.created += 1
            else:
                changed = self._update_resource(existing, provider_resource)
                if changed:
                    result.updated += 1
                else:
                    result.unchanged += 1

            if sync_metrics:
                self._sync_metrics(provider_resource)

        return result

    def _find_by_provider_id(self, provider_resource_id: str) -> CloudResource | None:
        """Locate an existing resource by provider-specific ID and owner."""
        candidates = self.resource_repo.get_user_resources(self.user.id)
        for resource in candidates:
            if resource.provider_resource_id == provider_resource_id:
                return resource
        return None

    def _create_resource(self, data: ProviderResource) -> CloudResource:
        """Insert a new CloudResource from provider data."""
        resource = CloudResource(
            user_id=self.user.id,
            provider_resource_id=data.provider_resource_id,
            name=data.name,
            provider_type=data.provider,
            region=data.region,
            cpu_utilization=data.cpu_utilization,
            memory_utilization=data.memory_utilization,
            storage_utilization=data.storage_utilization,
            network_utilization=data.network_utilization,
            current_capacity=data.capacity,
            estimated_cost=data.estimated_cost,
        )
        return self.resource_repo.create(resource)

    def _update_resource(self, resource: CloudResource, data: ProviderResource) -> bool:
        """Update an existing resource if provider data has changed.

        Returns True if any field changed, False otherwise.
        """
        updates: dict[str, object] = {}
        if resource.name != data.name:
            updates["name"] = data.name
        if resource.provider_type != data.provider:
            updates["provider_type"] = data.provider
        if resource.region != data.region:
            updates["region"] = data.region
        if abs(resource.cpu_utilization - data.cpu_utilization) > 1e-9:
            updates["cpu_utilization"] = data.cpu_utilization
        if abs(resource.memory_utilization - data.memory_utilization) > 1e-9:
            updates["memory_utilization"] = data.memory_utilization
        if abs(resource.storage_utilization - data.storage_utilization) > 1e-9:
            updates["storage_utilization"] = data.storage_utilization
        if abs(resource.network_utilization - data.network_utilization) > 1e-9:
            updates["network_utilization"] = data.network_utilization
        if abs(resource.current_capacity - data.capacity) > 1e-9:
            updates["current_capacity"] = data.capacity
        if abs(resource.estimated_cost - data.estimated_cost) > 1e-9:
            updates["estimated_cost"] = data.estimated_cost

        if not updates:
            return False

        self.resource_repo.update(resource, **updates)
        return True

    def _sync_metrics(self, data: ProviderResource) -> None:
        """Store provider-reported metrics through the MetricService.

        Metrics are stored for the requesting user's own resources via the
        existing MetricService layer so Phase 9 ML can use them later.
        """
        provider_metrics = self.provider.get_metrics(data.provider_resource_id)

        # Find the resource by provider ID under this user's scope.
        resource = self._find_by_provider_id(data.provider_resource_id)
        if resource is None:
            return

        for provider_metric in provider_metrics:
            metric_data = MetricCreate(
                timestamp=provider_metric.timestamp,
                cpu_utilization=provider_metric.cpu_utilization,
                memory_utilization=provider_metric.memory_utilization,
                storage_utilization=provider_metric.storage_utilization,
                network_utilization=provider_metric.network_utilization,
            )
            self.metric_service.create_metric(resource=resource, metric_data=metric_data)
