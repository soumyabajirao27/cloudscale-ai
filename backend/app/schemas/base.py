"""Shared Pydantic base schemas and field validators.

Defines reusable primitives (ORMModel, UTC datetime) and the common
password-strength validator used by request schemas across modules.
"""

from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field, field_validator


class ORMModel(BaseModel):
    """Base schema with ORM attribute population enabled.

    ``from_attributes=True`` lets Pydantic read fields directly from
    SQLAlchemy model instances, simplifying response construction.
    """

    model_config = ConfigDict(from_attributes=True)


class UTCModel(ORMModel):
    """Base schema for objects carrying timezone-aware timestamps."""

    created_at: datetime
    updated_at: datetime


def validate_password_strength(value: str) -> str:
    """Enforce production password policy.

    Rules:
        - At least 8 characters
        - Contains at least one uppercase letter
        - Contains at least one lowercase letter
        - Contains at least one digit

    Args:
        value: The candidate plaintext password.

    Returns:
        The validated password (unchanged).

    Raises:
        ValueError: If any policy rule is violated.
    """
    if len(value) < 8:
        raise ValueError("Password must be at least 8 characters long")
    if not any(c.isupper() for c in value):
        raise ValueError("Password must contain at least one uppercase letter")
    if not any(c.islower() for c in value):
        raise ValueError("Password must contain at least one lowercase letter")
    if not any(c.isdigit() for c in value):
        raise ValueError("Password must contain at least one digit")
    return value


class PasswordFieldMixin(ORMModel):
    """Mixin providing a validated ``password`` field."""

    password: str = Field(..., min_length=8, max_length=128)

    @field_validator("password")
    @classmethod
    def _validate_password_strength(cls, v: str) -> str:
        return validate_password_strength(v)


__all__ = ["ORMModel", "UTCModel", "PasswordFieldMixin", "validate_password_strength"]

