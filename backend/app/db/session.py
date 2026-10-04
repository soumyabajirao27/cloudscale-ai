"""Database session management.

Provides ``SessionLocal`` (a configured ``sessionmaker``) and the
``get_db`` FastAPI dependency used to obtain a request-scoped session.
"""

from collections.abc import Generator

from sqlalchemy.orm import Session, sessionmaker

from app.db.database import engine

SessionLocal = sessionmaker(
    bind=engine,
    autoflush=False,
    autocommit=False,
    expire_on_commit=False,
)


def get_db() -> Generator[Session, None, None]:
    """FastAPI dependency yielding a database session.

    Ensures the session is always closed, even when an exception is raised.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

