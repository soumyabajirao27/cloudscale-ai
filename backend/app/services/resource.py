"""Cloud Resource business service layer.

Coordinates cloud resource CRUD operations and optimization analysis through
the repository contract and security authorization rules.
"""

from sqlalchemy.orm import Session

from app.core.exceptions import AuthorizationException, ResourceNotFoundException
from app.models.resource import CloudResource
from app.models.user import User
from app.repositories.metric import MetricRepository
from app.repositories.resource import ResourceRepository
from app.schemas.metric import MetricCreate, MetricResponse
from app.schemas.optimization import OptimizationAnalysis
from app.schemas.resource import ResourceCreate, ResourceUpdate
from app.services.metric import MetricService
from app.services.ml_optimization import MLOptimizationEngine
from app.services.optimization import OptimizationService


class ResourceService:
    """Business logic for cloud resource management and optimization."""

    def __init__(self, db: Session) -> None:
        self.db = db
        self.repository = ResourceRepository(db)
        self.metric_repository = MetricRepository(db)
        # Use the ML-backed engine with deterministic baseline fallback.
        self.optimization_service = OptimizationService(engine=MLOptimizationEngine())

    def create_resource(self, user_id: int, resource_data: ResourceCreate) -> CloudResource:
        """Create a new cloud resource bound to the authenticated user ID."""
        resource = CloudResource(
            user_id=user_id,
            name=resource_data.name,
            provider_type=resource_data.provider_type,
            region=resource_data.region,
            cpu_utilization=resource_data.cpu_utilization,
            memory_utilization=resource_data.memory_utilization,
            storage_utilization=resource_data.storage_utilization,
            network_utilization=resource_data.network_utilization,
            current_capacity=resource_data.current_capacity,
            estimated_cost=resource_data.estimated_cost,
        )
        return self.repository.create(resource)

    def get_resource_by_id(self, resource_id: int, current_user: User) -> CloudResource:
        """Retrieve a cloud resource by ID after enforcing ownership authorization."""
        resource = self.repository.get_by_id(resource_id)
        if resource is None:
            raise ResourceNotFoundException(message="Cloud resource not found")

        if resource.user_id != current_user.id and not current_user.is_superuser:
            raise AuthorizationException(message="Permission denied")

        return resource

    def list_user_resources(self, current_user: User) -> list[CloudResource]:
        """List cloud resources accessible by the authenticated user."""
        if current_user.is_superuser:
            return self.repository.get_all()
        return self.repository.get_user_resources(current_user.id)

    def update_resource(
        self, resource_id: int, resource_data: ResourceUpdate, current_user: User
    ) -> CloudResource:
        """Partially update an existing cloud resource after validating ownership."""
        resource = self.get_resource_by_id(resource_id=resource_id, current_user=current_user)

        update_fields: dict[str, object] = {}
        for field, value in resource_data.model_dump(exclude_unset=True).items():
            if value is not None:
                update_fields[field] = value

        if not update_fields:
            return resource

        return self.repository.update(resource, **update_fields)

    def delete_resource(self, resource_id: int, current_user: User) -> bool:
        """Delete an existing cloud resource after validating ownership."""
        resource = self.get_resource_by_id(resource_id=resource_id, current_user=current_user)
        return self.repository.delete(resource)

    def analyze_resource(self, resource_id: int, current_user: User) -> OptimizationAnalysis:
        """Run AI optimization analysis on a specific cloud resource.

        Uses the ML demand prediction engine when historical metrics and a
        trained model are available; otherwise falls back transparently to
        the deterministic baseline rule engine. The response indicates the
        source via ``analysis_source``.
        """
        resource = self.get_resource_by_id(resource_id=resource_id, current_user=current_user)
        metrics = self.metric_repository.get_metrics_for_resource(resource_id=resource_id)
        return self.optimization_service.analyze(resource, metrics)

    def create_metric(
        self,
        resource_id: int,
        metric_data,
        current_user: User,
    ):
        """Create a historical metric observation after validating ownership."""
        resource = self.get_resource_by_id(resource_id=resource_id, current_user=current_user)
        metric_service = MetricService(db=self.db)
        return metric_service.create_metric(resource=resource, metric_data=metric_data)

    def list_metrics(
        self,
        resource_id: int,
        current_user: User,
        limit: int | None = None,
    ):
        """List chronological metric samples after validating ownership."""
        self.get_resource_by_id(resource_id=resource_id, current_user=current_user)
        metric_service = MetricService(db=self.db)
        return metric_service.list_metrics(resource_id=resource_id, limit=limit)
