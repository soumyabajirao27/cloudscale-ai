"""Generic SQLAlchemy 2.0 repository helpers.

This repository layer is intentionally thin: each repository accepts an
existing ``Session`` and performs only data-access operations against the
mapped ORM model class.
"""

from typing import Any, Generic, TypeVar

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.db.base import Base

ModelT = TypeVar("ModelT", bound=Base)


class BaseRepository(Generic[ModelT]):
    """Reusable CRUD-style repository for a mapped ORM model class."""

    def __init__(self, db: Session, model: type[ModelT]) -> None:
        self.db = db
        self.model = model

    def get_by_id(self, obj_id: Any) -> ModelT | None:
        """Return a single ORM row by primary-key value."""
        statement = select(self.model).where(self.model.id == obj_id)
        return self.db.execute(statement).scalar_one_or_none()

    def get_all(self) -> list[ModelT]:
        """Return every row for the mapped model."""
        statement = select(self.model)
        return list(self.db.execute(statement).scalars().all())

    def count(self) -> int:
        """Return the number of rows for the mapped model."""
        statement = select(func.count()).select_from(self.model)
        return int(self.db.execute(statement).scalar_one())

    def create(self, obj: ModelT) -> ModelT:
        """Insert a new ORM object and commit the write transaction."""
        self.db.add(obj)
        self.db.flush()
        self.db.commit()
        self.db.refresh(obj)
        return obj

    def update(self, obj: ModelT, **kwargs: Any) -> ModelT:
        """Update an existing ORM object with the supplied keyword values."""
        for field, value in kwargs.items():
            if not hasattr(obj, field):
                raise AttributeError(f"{self.model.__name__} has no attribute '{field}'")
            setattr(obj, field, value)

        self.db.add(obj)
        self.db.flush()
        self.db.commit()
        return obj

    def delete(self, obj: ModelT) -> bool:
        """Delete an existing ORM object and commit the write transaction."""
        self.db.delete(obj)
        self.db.commit()
        return True
