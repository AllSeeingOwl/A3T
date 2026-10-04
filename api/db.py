import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base


def fix_database_url(url: str) -> str:
    """
    Ensure PostgreSQL URLs use the explicit postgresql+psycopg2 driver dialect
    instead of defaulting to psycopg (v3) in SQLAlchemy 2.0+.
    """
    if url.startswith("postgres://"):
        return url.replace("postgres://", "postgresql+psycopg2://", 1)
    if url.startswith("postgresql://"):
        return url.replace("postgresql://", "postgresql+psycopg2://", 1)
    return url


DATABASE_URL = fix_database_url(
    os.getenv(
        "DATABASE_URL",
        "postgresql://a3t_dev:dev_password@localhost:5432/a3t_db"
    )
)

# Use SQLite fallback in tests/local dev if postgresql driver is missing
# or SQLite is configured
if DATABASE_URL.startswith("sqlite"):
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False}
    )
else:
    engine = create_engine(DATABASE_URL, pool_pre_ping=True)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
