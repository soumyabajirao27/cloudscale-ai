"""Authentication API router endpoints (v1)."""

from fastapi import APIRouter, Depends, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.auth import TokenResponse
from app.schemas.user import UserCreate, UserLogin, UserResponse
from app.services.auth import AuthService

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user account",
)
def register(
    user_data: UserCreate,
    db: Session = Depends(get_db),
) -> UserResponse:
    """Register a new user with Argon2 password hashing."""
    auth_service = AuthService(db)
    user = auth_service.register_user(user_data)
    return UserResponse.model_validate(user)


@router.post(
    "/login",
    response_model=TokenResponse,
    status_code=status.HTTP_200_OK,
    summary="Authenticate user and obtain JWT access token (JSON payload)",
)
def login(
    login_data: UserLogin,
    db: Session = Depends(get_db),
) -> TokenResponse:
    """Authenticate user credentials and return a Bearer JWT access token."""
    auth_service = AuthService(db)
    return auth_service.authenticate_user(login_data)


@router.post(
    "/token",
    response_model=TokenResponse,
    status_code=status.HTTP_200_OK,
    summary="Obtain OAuth2 JWT access token (OAuth2 form payload for Swagger)",
)
def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
) -> TokenResponse:
    """OAuth2 compatible token login endpoint using form data."""
    auth_service = AuthService(db)
    login_data = UserLogin(email=form_data.username, password=form_data.password)
    return auth_service.authenticate_user(login_data)


@router.get(
    "/me",
    response_model=UserResponse,
    status_code=status.HTTP_200_OK,
    summary="Get current authenticated user details",
)
def get_me(
    current_user: User = Depends(get_current_user),
) -> UserResponse:
    """Retrieve profile of the currently authenticated user."""
    return UserResponse.model_validate(current_user)
