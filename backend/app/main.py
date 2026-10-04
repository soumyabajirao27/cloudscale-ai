from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.v1.router import api_router
from app.core.config import settings
from app.core.exceptions import AppException
from app.core.logging import logger
from app.schemas.response import BaseResponse, ErrorResponse

app = FastAPI(
    title=settings.APP_NAME,
    description="Machine Learning-Driven Auto Scaling and Cost Optimization Framework for Cloud Resource Management",
    version=settings.APP_VERSION,
    debug=settings.DEBUG,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- Global exception handlers -------------------------------------------


@app.exception_handler(AppException)
async def app_exception_handler(request: Request, exc: AppException) -> JSONResponse:
    logger.error(f"AppException: {exc.message}")
    return JSONResponse(
        status_code=exc.status_code,
        content=ErrorResponse(message=exc.message).model_dump(),
    )


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException) -> JSONResponse:
    return JSONResponse(
        status_code=exc.status_code,
        content=ErrorResponse(message=str(exc.detail)).model_dump(),
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(
    request: Request, exc: RequestValidationError
) -> JSONResponse:
    logger.warning(f"Request validation failed: {exc.errors()}")
    return JSONResponse(
        status_code=422,
        content=ErrorResponse(
            message="Request validation failed",
            errors={"detail": exc.errors()},
        ).model_dump(),
    )


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    logger.exception(f"Unhandled exception: {exc}")
    message = "Internal server error"
    if settings.DEBUG:
        message = f"{message}: {exc}"
    return JSONResponse(
        status_code=500,
        content=ErrorResponse(message=message).model_dump(),
    )


# --- Router registration ---------------------------------------------------

app.include_router(api_router, prefix=settings.API_V1_PREFIX)


@app.get("/", response_model=BaseResponse[dict])
def root() -> BaseResponse[dict]:
    return BaseResponse(
        success=True,
        message="Welcome to CloudScale AI Backend",
        data={
            "status": "Running",
            "version": settings.APP_VERSION,
        },
    )

