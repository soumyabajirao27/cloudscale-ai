"""Authentication business service layer.

Coordinates user registration and authentication workflows using UserRepository
and core security functions without direct database queries.
"""

from sqlalchemy.orm import Session

from app.core.exceptions import AuthenticationException, ValidationException
from app.core.security import create_access_token, hash_password, verify_password
from app.models.user import User
from app.repositories.user import UserRepository
from app.schemas.auth import TokenResponse
from app.schemas.user import UserCreate, UserLogin


class AuthService:
    """Business service for authentication and user registration operations."""

    def __init__(self, db: Session) -> None:
        self.db = db
        self.user_repository = UserRepository(db)

    def register_user(self, user_data: UserCreate) -> User:
        """Register a new user account with Argon2 password hashing.

        Args:
            user_data: Validated user creation payload.

        Returns:
            The created User ORM instance.

        Raises:
            ValidationException: If email address is already registered.
        """
        normalized_email = user_data.email.strip().lower()

        if self.user_repository.email_exists(normalized_email):
            raise ValidationException(message="Email already exists")

        hashed_pw = hash_password(user_data.password)

        user = User(
            full_name=user_data.full_name,
            email=normalized_email,
            hashed_password=hashed_pw,
            is_active=True,
            is_superuser=False,
        )

        return self.user_repository.create(user)

    def authenticate_user(self, login_data: UserLogin) -> TokenResponse:
        """Authenticate user credentials and issue a signed JWT access token.

        Args:
            login_data: User login credentials (email and password).

        Returns:
            TokenResponse containing the JWT access token and token type.

        Raises:
            AuthenticationException: If credentials are invalid or user is inactive.
        """
        normalized_email = login_data.email.strip().lower()

        user = self.user_repository.get_by_email(normalized_email)
        if user is None:
            # Generic error to prevent email enumeration
            raise AuthenticationException(message="Invalid credentials")

        if not user.is_active:
            raise AuthenticationException(message="Inactive user account")

        if not verify_password(login_data.password, user.hashed_password):
            # Generic error message matching non-existent user
            raise AuthenticationException(message="Invalid credentials")

        access_token = create_access_token(subject=user.id)

        return TokenResponse(
            access_token=access_token,
            token_type="bearer",
        )
