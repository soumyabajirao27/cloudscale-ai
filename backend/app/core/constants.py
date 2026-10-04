"""Application-wide constants.

Central place for shared immutable values used across the codebase.
"""

# Service identity
SERVICE_NAME: str = "CloudScale AI Backend"

# Common application messages
HEALTH_MESSAGE: str = "Service is healthy"

# Default pagination values
DEFAULT_PAGE: int = 1
DEFAULT_PAGE_SIZE: int = 20
MAX_PAGE_SIZE: int = 100

# Time formats
DEFAULT_TIME_FORMAT: str = "%Y-%m-%d %H:%M:%S"
ISO_TIME_FORMAT: str = "%Y-%m-%dT%H:%M:%SZ"

# Cache key prefix (reserved for the Phase 2 caching layer)
CACHE_KEY_PREFIX: str = "cloudscale:"

