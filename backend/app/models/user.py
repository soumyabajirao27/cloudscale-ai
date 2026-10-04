"""User ORM model.

Represents an application user. Inherits the shared ``BaseModel`` columns
(``id``, ``created_at``, ``updated_at``) and adds user-specific fields.
"""

from sqlalchemy import Boolean, String
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import BaseModel


class User(BaseModel):
    """Application user account.

    Attributes:
        full_name: User's display name.
        email: Unique login identifier; indexed for fast lookups.
        hashed_password: Argon2/bcrypt hash of the user's password
            (never the plaintext).
        is_active: Whether the account is enabled.
        is_superuser: Whether the user has administrative privileges.
    """

    __tablename__ = "users"

    full_name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )
    email: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        index=True,
        nullable=False,
    )
    hashed_password: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )
    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
    )
    is_superuser: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
    )

