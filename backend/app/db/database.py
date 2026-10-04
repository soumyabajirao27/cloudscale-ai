"""Database engine and connection management.

Creates the SQLAlchemy engine from application settings with a
production-ready connection pool. Tables are created elsewhere
(see Alembic / Phase 2 migrations) — not here.
"""

from sqlalchemy import Engine, create_engine

from app.core.config import settings


def create_db_engine() -> Engine:
    """Build the SQLAlchemy engine using centralized application settings.

    Configuration:
        - Connection URL from ``settings.DATABASE_URL`` (PostgreSQL via psycopg 3)
        - ``echo`` mirrors ``settings.DB_ECHO`` (SQL logging off in production)
        - Pool ``pre_ping`` validates connections before checkout
        - Bounded pool sizes configured for production concurrency
        - Connections recycled after one hour to avoid stale connections
    """
    return create_engine(
        settings.DATABASE_URL,
        echo=settings.DB_ECHO,
        future=True,
        pool_pre_ping=settings.DB_POOL_PRE_PING,
        pool_size=settings.DB_POOL_SIZE,
        max_overflow=settings.DB_MAX_OVERFLOW,
        pool_recycle=settings.DB_POOL_RECYCLE,
    )


engine = create_db_engine()

