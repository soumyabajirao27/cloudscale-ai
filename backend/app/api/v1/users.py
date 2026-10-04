"""User management API router endpoints (v1)."""

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.security import get_current_user, verify_user_access
from app.db.session import get_db
from app.models.user import User
from app.schemas.response import BaseResponse
from app.schemas.user import UserResponse, UserUpdate
from app.services.user import UserService

router = APIRouter(prefix="/users", tags=["Users"])


@router.get(
    "/me",
    response_model=UserResponse,
    status_code=status.HTTP_200_OK,
    summary="Get profile of current authenticated user",
)
def get_me(
    current_user: User = Depends(get_current_user),
) -> UserResponse:
    """Retrieve the authenticated user's own profile."""
    return UserResponse.model_validate(current_user)


@router.get(
    "/{user_id}",
    response_model=UserResponse,
    status_code=status.HTTP_200_OK,
    summary="Get user record by ID",
)
def get_user_by_id(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> UserResponse:
    """Retrieve user by primary key.

    Requires self-ownership or superuser authorization.
    """
    verify_user_access(target_user_id=user_id, current_user=current_user)
    user_service = UserService(db)
    user = user_service.get_user_by_id(user_id)
    return UserResponse.model_validate(user)


@router.patch(
    "/{user_id}",
    response_model=UserResponse,
    status_code=status.HTTP_200_OK,
    summary="Partially update user record by ID",
)
def update_user(
    user_id: int,
    user_data: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> UserResponse:
    """Partially update an existing user record.

    Requires self-ownership or superuser authorization.
    """
    verify_user_access(target_user_id=user_id, current_user=current_user)
    user_service = UserService(db)
    updated_user = user_service.update_user(user_id=user_id, user_data=user_data)
    return UserResponse.model_validate(updated_user)


@router.delete(
    "/{user_id}",
    response_model=BaseResponse[dict],
    status_code=status.HTTP_200_OK,
    summary="Delete user record by ID",
)
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> BaseResponse[dict]:
    """Delete a user record by primary key.

    Requires self-ownership or superuser authorization.
    """
    verify_user_access(target_user_id=user_id, current_user=current_user)
    user_service = UserService(db)
    user_service.delete_user(user_id)
    return BaseResponse(
        success=True,
        message="User deleted successfully",
    )
