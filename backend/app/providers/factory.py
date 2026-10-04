"""Provider factory for selecting the configured cloud provider."""

from __future__ import annotations

from app.core.config import settings
from app.providers.base import BaseCloudProvider
from app.providers.mock import MockCloudProvider


def get_provider(provider_name: str | None = None) -> BaseCloudProvider:
    """Return a provider instance based on the configured provider key.

    Args:
        provider_name: Optional override; defaults to ``settings.CLOUD_PROVIDER``.

    Returns:
        A concrete ``BaseCloudProvider`` implementation.

    Raises:
        ValueError: If the provider key is unknown.
    """
    name = (provider_name or settings.CLOUD_PROVIDER).strip().lower()

    if name == "mock":
        return MockCloudProvider()

    # Future real providers (aws/gcp/azure) can be added here behind
    # optional dependencies without changing the sync service.
    raise ValueError(f"Unsupported cloud provider: {name}")
