"""Custom exception hierarchy for the backend application.

Provides a base ``AppException`` plus domain-specific subclasses that carry
a human-readable ``message`` and an HTTP ``status_code``. Handlers can rely
on these fields to translate exceptions into HTTP responses.
"""


class AppException(Exception):
    """Base application exception carrying a message and HTTP status code."""

    def __init__(self, message: str, status_code: int = 500) -> None:
        """Initialize the exception with a message and optional status code."""
        super().__init__(message)
        self.message = message
        self.status_code = status_code

    def __str__(self) -> str:
        """Return the exception message."""
        return self.message


class ResourceNotFoundException(AppException):
    """Raised when a requested resource does not exist (HTTP 404)."""

    def __init__(self, message: str = "Resource not found", status_code: int = 404) -> None:
        super().__init__(message, status_code)


class ValidationException(AppException):
    """Raised when input data fails validation (HTTP 400)."""

    def __init__(self, message: str = "Validation failed", status_code: int = 400) -> None:
        super().__init__(message, status_code)


class AuthenticationException(AppException):
    """Raised when a request cannot be authenticated (HTTP 401)."""

    def __init__(self, message: str = "Authentication required", status_code: int = 401) -> None:
        super().__init__(message, status_code)


class AuthorizationException(AppException):
    """Raised when an authenticated user lacks permission (HTTP 403)."""

    def __init__(self, message: str = "Permission denied", status_code: int = 403) -> None:
        super().__init__(message, status_code)

