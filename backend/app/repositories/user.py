"""User repository implementation backed by SQLAlchemy 2.0."""

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.user import User
from app.repositories.base import BaseRepository


class UserRepository(BaseRepository[User]):
    """Repository for the ``users`` table."""

    def __init__(self, db: Session) -> None:
        super().__init__(db=db, model=User)

    def get_by_email(self, email: str) -> User | None:
        """Fetch a user record by email address without committing."""
        statement = select(User).where(User.email == email)
        return self.db.execute(statement).scalar_one_or_none()

    def email_exists(self, email: str) -> bool:
        """Check whether a user with the supplied email exists."""
        statement = select(User.id).where(User.email == email).limit(1)
        value = self.db.execute(statement).scalar_one_or_none()
        return value is not None
