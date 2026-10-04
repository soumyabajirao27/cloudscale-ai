"""Resource repository implementation backed by SQLAlchemy 2.0."""

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.resource import CloudResource
from app.repositories.base import BaseRepository


class ResourceRepository(BaseRepository[CloudResource]):
    """Repository for the ``cloud_resources`` table."""

    def __init__(self, db: Session) -> None:
        super().__init__(db=db, model=CloudResource)

    def get_user_resources(self, user_id: int) -> list[CloudResource]:
        """Fetch all cloud resources owned by a specific user."""
        statement = select(CloudResource).where(CloudResource.user_id == user_id)
        return list(self.db.execute(statement).scalars().all())

    def get_by_id_and_user(self, resource_id: int, user_id: int) -> CloudResource | None:
        """Fetch a specific resource owned by a user without raising on miss."""
        statement = select(CloudResource).where(
            CloudResource.id == resource_id,
            CloudResource.user_id == user_id,
        )
        return self.db.execute(statement).scalar_one_or_none()
