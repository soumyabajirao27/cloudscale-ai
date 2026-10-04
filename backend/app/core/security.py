"""Security primitives: Argon2 password hashing, JWT creation/decoding, and FastAPI authentication dependencies."""

from datetime import datetime, timedelta, timezone
from typing import Any

import jwt
from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
from pwdlib import PasswordHash
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.exceptions import AuthenticationException, AuthorizationException
from app.db.session import get_db
from app.models.user import User
from app.repositories.user import UserRepository

# Initialize pwdlib PasswordHash using the recommended configuration (Argon2)
password_hash_context = PasswordHash.recommended()

# FastAPI OAuth2 Bearer scheme pointing to the OAuth2 token endpoint
oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_PREFIX}/auth/token",
    auto_error=True,
)


def hash_password(password: str) -> str:
    """Hash a plaintext password using pwdlib with Argon2.

    Args:
        password: The plaintext password string to hash.

    Returns:
        The Argon2 password hash string.
    """
    return password_hash_context.hash(password)


def verify_password(password: str, password_hash: str) -> bool:
    """Verify a plaintext password against a stored Argon2 password hash.

    Args:
        password: Plaintext candidate password.
        password_hash: Stored password hash string.

    Returns:
        True if the password matches the hash, False otherwise.
    """
    return password_hash_context.verify(password, password_hash)


def create_access_token(
    data: dict[str, Any] | None = None,
    subject: str | int | None = None,
    expires_delta: timedelta | None = None,
) -> str:
    """Create a signed JWT access token containing standard claims.

    Args:
        data: Additional claims to include in the payload (optional).
        subject: Subject identifier (typically the user ID).
        expires_delta: Optional custom duration before expiration.

    Returns:
        Encoded JWT token string.
    """
    to_encode = data.copy() if data else {}

    now = datetime.now(timezone.utc)
    if expires_delta:
        expire = now + expires_delta
    else:
        expire = now + timedelta(minutes=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES)

    if subject is not None:
        to_encode["sub"] = str(subject)

    to_encode.update(
        {
            "exp": expire,
            "iat": now,
        }
    )

    return jwt.encode(
        to_encode,
        settings.JWT_SECRET_KEY,
        algorithm=settings.JWT_ALGORITHM,
    )


def decode_access_token(token: str) -> dict[str, Any]:
    """Decode and validate a JWT access token.

    Args:
        token: The encoded JWT token string.

    Returns:
        Decoded payload dictionary.

    Raises:
        AuthenticationException: If token is expired, invalid, or malformed.
    """
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM],
        )
        return payload
    except jwt.ExpiredSignatureError:
        raise AuthenticationException(message="Token has expired")
    except jwt.PyJWTError:
        raise AuthenticationException(message="Could not validate credentials")


def get_current_user(
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme),
) -> User:
    """FastAPI dependency to retrieve and validate the current authenticated user.

    Args:
        db: Request-scoped database session.
        token: Extracted Bearer token string.

    Returns:
        Authenticated User ORM instance.

    Raises:
        AuthenticationException: If token is invalid, user is missing, or account is inactive.
    """
    payload = decode_access_token(token)

    subject = payload.get("sub")
    if not subject:
        raise AuthenticationException(message="Could not validate credentials")

    try:
        user_id = int(subject)
    except (ValueError, TypeError):
        raise AuthenticationException(message="Could not validate credentials")

    user_repo = UserRepository(db)
    user = user_repo.get_by_id(user_id)

    if user is None:
        raise AuthenticationException(message="User not found")

    if not user.is_active:
        raise AuthenticationException(message="Inactive user account")

    return user


def get_current_active_superuser(
    current_user: User = Depends(get_current_user),
) -> User:
    """FastAPI dependency to enforce superuser authorization.

    Args:
        current_user: The authenticated user instance.

    Returns:
        User ORM instance if superuser status is confirmed.

    Raises:
        AuthorizationException: If the user lacks superuser privileges.
    """
    if not current_user.is_superuser:
        raise AuthorizationException(message="Permission denied")
    return current_user


def verify_user_access(target_user_id: int, current_user: User) -> None:
    """Verify that the current user is either accessing their own account or is a superuser.

    Args:
        target_user_id: The ID of the target user resource.
        current_user: The authenticated requesting user.

    Raises:
        AuthorizationException: If user is attempting unauthorized cross-user access.
    """
    if current_user.id != target_user_id and not current_user.is_superuser:
        raise AuthorizationException(message="Permission denied")

