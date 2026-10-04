from fastapi import APIRouter

from app.api.v1.auth import router as auth_router
from app.api.v1.resources import router as resources_router
from app.api.v1.users import router as users_router
from app.core.config import settings
from app.core.constants import HEALTH_MESSAGE, SERVICE_NAME
from app.schemas.response import BaseResponse

api_router = APIRouter()

api_router.include_router(auth_router)
api_router.include_router(users_router)
api_router.include_router(resources_router)




@api_router.get("/health", response_model=BaseResponse[dict], tags=["System"])
async def health_check() -> BaseResponse[dict]:
    """Liveness probe for the API."""
    return BaseResponse(
        success=True,
        message=HEALTH_MESSAGE,
        data={
            "service": SERVICE_NAME,
            "version": settings.APP_VERSION,
        },
    )


