"""Authentication Pydantic schemas (Pydantic v2).

Defines payloads for token responses and login operations.
"""

from pydantic import Field

from app.schemas.base import ORMModel


class TokenResponse(ORMModel):
    """Access token response model.

    Attributes:
        access_token: Encoded JWT access token string.
        token_type: Token type indicator (defaults to "bearer").
    """

    access_token: str
    token_type: str = Field(default="bearer")


__all__ = ["TokenResponse"]
