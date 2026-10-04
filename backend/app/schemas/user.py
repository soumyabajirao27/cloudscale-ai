"""User request/response Pydantic schemas (Pydantic v2).

Request schemas validate client input (``UserCreate``, ``UserUpdate``,
``UserLogin``). Response schemas shape API output (``UserResponse``) and
represent the stored row (``UserInDB``). Sensitive fields such as
``hashed_password`` are only present on ``UserInDB`` and are never
returned by the API.
"""

from datetime import datetime

from pydantic import EmailStr, Field, field_validator

from app.schemas.base import ORMModel, PasswordFieldMixin, UTCModel, validate_password_strength

# ---------------------------------------------------------------------------
# Request schemas
# ---------------------------------------------------------------------------


class UserCreate(PasswordFieldMixin):
    """Payload for creating a new user.

    Attributes:
        full_name: User's display name (1-100 chars).
        email: Unique, validated email address (lowercased).
        password: Plaintext password validated against the strength policy.
    """

    full_name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr


class UserUpdate(ORMModel):
    """Payload for partially updating a user.

    All fields are optional so clients can send only the fields they wish
    to change. ``password`` is a separate (non-inherited) optional field.
    """

    full_name: str | None = Field(default=None, min_length=1, max_length=100)
    email: EmailStr | None = None
    password: str | None = Field(default=None, min_length=8, max_length=128)

    @field_validator("password")
    @classmethod
    def _validate_password_strength(cls, v: str | None) -> str | None:
        """Validate password strength only when a new password is provided."""
        if v is None:
            return v
        return validate_password_strength(v)


class UserLogin(ORMModel):
    """Payload for authenticating a user.

    Attributes:
        email: User's email address.
        password: Plaintext password (minimum length enforced).
    """

    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)


# ---------------------------------------------------------------------------
# Response schemas
# ---------------------------------------------------------------------------


class UserResponse(UTCModel):
    """Public user representation returned by the API.

    Deliberately excludes ``hashed_password`` and internal flags unless
    required by the endpoint.
    """

    id: int
    full_name: str
    email: EmailStr
    is_active: bool
    is_superuser: bool


class UserInDB(UTCModel):
    """Internal representation of a stored user row.

    Includes the ``hashed_password``; intended only for service/repository
    layers, never for API responses.
    """

    id: int
    full_name: str
    email: EmailStr
    hashed_password: str
    is_active: bool
    is_superuser: bool


__all__ = ["UserCreate", "UserUpdate", "UserLogin", "UserResponse", "UserInDB"]

