"""Standard API response schemas.

Defines a generic success envelope (``BaseResponse[T]``) and a uniform
error envelope (``ErrorResponse``) used across all backend endpoints.
"""

from typing import Any, Generic, TypeVar

from pydantic import BaseModel

T = TypeVar("T")


class BaseResponse(BaseModel, Generic[T]):
    """Generic success response envelope."""

    success: bool
    message: str
    data: T | None = None


class ErrorResponse(BaseModel):
    """Uniform error response envelope."""

    success: bool = False
    message: str
    errors: dict[str, Any] | None = None

