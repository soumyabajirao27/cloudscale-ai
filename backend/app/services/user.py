"""User business service layer.

Coordinates user-focused business operations through the existing repository
contract. The service accepts a SQLAlchemy session and performs all data
access through ``UserRepository``.
"""

from sqlalchemy.orm import Session

from app.core.exceptions import ResourceNotFoundException, ValidationException
from app.core.security import hash_password
from app.models.user import User
from app.repositories.user import UserRepository
from app.schemas.user import UserCreate, UserUpdate


class UserService:
    """Business logic for user CRUD operations."""

    def __init__(self, db: Session) -> None:
        self.db = db
        self.repository = UserRepository(db)

    def get_user_by_id(self, user_id: int) -> User:
        """Return a user ORM instance by primary key or raise if missing."""
        user = self.repository.get_by_id(user_id)
        if user is None:
            raise ResourceNotFoundException(message="User not found")
        return user

    def get_user_by_email(self, email: str) -> User | None:
        """Return a normalized email lookup result without raising on miss."""
        normalized_email = email.strip().lower()
        return self.repository.get_by_email(normalized_email)

    def email_exists(self, email: str) -> bool:
        """Return whether a normalized email is already present."""
        normalized_email = email.strip().lower()
        return self.repository.email_exists(normalized_email)

    def create_user(self, user_data: UserCreate) -> User:
        """Create a user after validating business-level constraints."""
        normalized_email = user_data.email.strip().lower()

        if self.repository.email_exists(normalized_email):
            raise ValidationException(message="Email already exists")

        hashed_pw = hash_password(user_data.password)

        user = User(
            full_name=user_data.full_name,
            email=normalized_email,
            hashed_password=hashed_pw,
            is_active=True,
            is_superuser=False,
        )
        return self.repository.create(user)

    def update_user(self, user_id: int, user_data: UserUpdate) -> User:
        """Update a user with only the request-provided fields."""
        user = self.get_user_by_id(user_id)

        update_fields: dict[str, object] = {}

        if user_data.full_name is not None:
            update_fields["full_name"] = user_data.full_name

        if user_data.email is not None:
            normalized_email = user_data.email.strip().lower()
            if normalized_email != user.email:
                if self.repository.email_exists(normalized_email):
                    raise ValidationException(message="Email already exists")
                update_fields["email"] = normalized_email

        if user_data.password is not None:
            update_fields["hashed_password"] = hash_password(user_data.password)

        if not update_fields:
            return user

        return self.repository.update(user, **update_fields)

    def delete_user(self, user_id: int) -> bool:
        """Delete the user referenced by primary key."""
        user = self.get_user_by_id(user_id)
        return self.repository.delete(user)

    def list_users(self) -> list[User]:
        """Return all users from the repository."""
        return self.repository.get_all()
