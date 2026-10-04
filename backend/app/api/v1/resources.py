"""Cloud Resources API router endpoints (v1)."""

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.security import get_current_active_superuser, get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.metric import MetricCreate, MetricResponse, TrainingResult
from app.schemas.optimization import OptimizationAnalysis
from app.schemas.response import BaseResponse
from app.schemas.resource import ResourceCreate, ResourceResponse, ResourceUpdate, SyncResourceResponse
from app.services.metric import MetricService
from app.services.provider_sync import ProviderSyncService
from app.services.resource import ResourceService

router = APIRouter(prefix="/resources", tags=["Cloud Resources"])


@router.post(
    "",
    response_model=ResourceResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new cloud resource",
)
def create_resource(
    resource_data: ResourceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ResourceResponse:
    """Register a new cloud resource under the authenticated user."""
    service = ResourceService(db)
    resource = service.create_resource(user_id=current_user.id, resource_data=resource_data)
    return ResourceResponse.model_validate(resource)


@router.get(
    "",
    response_model=list[ResourceResponse],
    status_code=status.HTTP_200_OK,
    summary="List all accessible cloud resources",
)
def list_resources(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[ResourceResponse]:
    """Retrieve all cloud resources owned by the authenticated user (or all if superuser)."""
    service = ResourceService(db)
    resources = service.list_user_resources(current_user=current_user)
    return [ResourceResponse.model_validate(r) for r in resources]


@router.get(
    "/{resource_id}",
    response_model=ResourceResponse,
    status_code=status.HTTP_200_OK,
    summary="Get cloud resource details by ID",
)
def get_resource_by_id(
    resource_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ResourceResponse:
    """Retrieve details for a specific cloud resource.

    Enforces ownership or superuser authorization.
    """
    service = ResourceService(db)
    resource = service.get_resource_by_id(resource_id=resource_id, current_user=current_user)
    return ResourceResponse.model_validate(resource)


@router.patch(
    "/{resource_id}",
    response_model=ResourceResponse,
    status_code=status.HTTP_200_OK,
    summary="Partially update a cloud resource by ID",
)
def update_resource(
    resource_id: int,
    resource_data: ResourceUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ResourceResponse:
    """Partially update metrics or details of an existing cloud resource.

    Enforces ownership or superuser authorization.
    """
    service = ResourceService(db)
    updated_resource = service.update_resource(
        resource_id=resource_id, resource_data=resource_data, current_user=current_user
    )
    return ResourceResponse.model_validate(updated_resource)


@router.delete(
    "/{resource_id}",
    response_model=BaseResponse[dict],
    status_code=status.HTTP_200_OK,
    summary="Delete a cloud resource by ID",
)
def delete_resource(
    resource_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> BaseResponse[dict]:
    """Delete a cloud resource by primary key.

    Enforces ownership or superuser authorization.
    """
    service = ResourceService(db)
    service.delete_resource(resource_id=resource_id, current_user=current_user)
    return BaseResponse(
        success=True,
        message="Cloud resource deleted successfully",
    )


@router.post(
    "/sync",
    response_model=SyncResourceResponse,
    status_code=status.HTTP_200_OK,
    summary="Synchronize cloud resources from the configured provider",
)
def sync_resources(
    sync_metrics: bool = Query(default=True, description="Whether to also store reported metrics"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> SyncResourceResponse:
    """Reconcile the current authenticated user's local resources with the
    configured cloud provider.

    Only resources owned by the caller are updated. Returns counts of newly
    created, updated, and unchanged resources.
    """
    from app.providers.factory import get_provider

    provider = get_provider()
    sync_service = ProviderSyncService(db=db, provider=provider, user=current_user)
    result = sync_service.sync_resources(sync_metrics=sync_metrics)

    message = (
        f"Synchronized {result.provider} resources: "
        f"{result.created} created, {result.updated} updated, {result.unchanged} unchanged."
    )
    return SyncResourceResponse(success=True, message=message, data=vars(result))


@router.post(
    "/{resource_id}/analyze",
    response_model=OptimizationAnalysis,
    status_code=status.HTTP_200_OK,
    summary="Run AI optimization analysis on a cloud resource",
)
def analyze_resource(
    resource_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> OptimizationAnalysis:
    """Run AI/ML optimization analysis for a specific cloud resource.

    Uses the ML demand prediction engine when historical metrics and a
    trained model are available; otherwise falls back transparently to the
    deterministic baseline rule engine. The response indicates the source
    via ``analysis_source``.
    """
    service = ResourceService(db)
    return service.analyze_resource(resource_id=resource_id, current_user=current_user)


@router.post(
    "/{resource_id}/metrics",
    response_model=MetricResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Record a historical metric observation for a cloud resource",
)
def create_metric(
    resource_id: int,
    metric_data: MetricCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> MetricResponse:
    """Record a new historical utilization metric sample.

    Enforces ownership or superuser authorization.
    """
    service = ResourceService(db)
    metric = service.create_metric(
        resource_id=resource_id,
        metric_data=metric_data,
        current_user=current_user,
    )
    return MetricResponse.model_validate(metric)


@router.get(
    "/{resource_id}/metrics",
    response_model=list[MetricResponse],
    status_code=status.HTTP_200_OK,
    summary="List historical metric observations for a cloud resource",
)
def list_metrics(
    resource_id: int,
    limit: int | None = Query(default=None, ge=1, le=1000, description="Maximum number of samples to return"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[MetricResponse]:
    """Retrieve chronological historical metric samples for a resource.

    Enforces ownership or superuser authorization.
    """
    service = ResourceService(db)
    metrics = service.list_metrics(
        resource_id=resource_id,
        current_user=current_user,
        limit=limit,
    )
    return [MetricResponse.model_validate(m) for m in metrics]


@router.post(
    "/model/train",
    response_model=TrainingResult,
    status_code=status.HTTP_200_OK,
    summary="Train the ML demand prediction model (superuser only)",
)
def train_model(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_superuser),
) -> TrainingResult:
    """Train (or retrain) the RandomForestRegressor demand prediction model.

    Restricted to superusers. Returns actual sample count, MAE, RMSE, R²,
    and the generated model version.
    """
    service = MetricService(db)
    return service.train_model()
