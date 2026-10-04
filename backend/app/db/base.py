"""SQLAlchemy 2.0 declarative base.

Defines the single ``Base`` class that every ORM model inherits from.
"""

from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    """Declarative base class for all ORM models."""

