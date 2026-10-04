"""Shared abstract ORM base model.

Every ORM model in the application inherits from ``BaseModel``, which
provides common columns (``id``, ``created_at``, ``updated_at``) so each
table gets a consistent primary key and audit timestamps automatically.
"""

from datetime import datetime

from sqlalchemy import DateTime, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class BaseModel(Base):
    """Abstract base class providing common columns for all models.

    Attributes:
        id: Auto-incrementing integer primary key.
        created_at: Timezone-aware timestamp set at insert time
            (server-side default).
        updated_at: Timezone-aware timestamp refreshed on every UPDATE
            (server-side default).
    """

    __abstract__ = True

    id: Mapped[int] = mapped_column(
        primary_key=True,
        autoincrement=True,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )

