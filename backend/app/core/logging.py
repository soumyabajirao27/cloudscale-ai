"""Centralized logging configuration for the backend.

Provides a single pre-configured ``logger`` instance (loguru) that can be
imported anywhere in the application:

    from app.core.logging import logger
"""

import sys

from loguru import logger

from app.core.config import settings

# Remove the default loguru handler (stderr) to avoid duplicate output.
logger.remove()

# Console handler with colored, structured output.
# ``diagnose`` is enabled only when DEBUG=True so that internal tracebacks
# are never exposed in production.
logger.add(
    sys.stdout,
    level="INFO",
    colorize=True,
    backtrace=True,
    diagnose=settings.DEBUG,
    enqueue=True,
    format=(
        "<green>{time:YYYY-MM-DD HH:mm:ss.SSS}</green> | "
        "<level>{level: <8}</level> | "
        "<cyan>{module}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - "
        "<level>{message}</level>"
    ),
)

