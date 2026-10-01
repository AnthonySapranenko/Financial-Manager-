from pathlib import Path

from sqlmodel import SQLModel, create_engine

import app.models  # noqa: F401  (importing registers the tables with SQLModel)

# Build the path from this file's location, so the database is always
# backend/finance.db no matter which folder the app is started from.
DATABASE_PATH = Path(__file__).resolve().parent.parent / "finance.db"

engine = create_engine(f"sqlite:///{DATABASE_PATH}")


def create_db_and_tables(db_engine=engine):
    """Create any tables that don't exist yet."""
    SQLModel.metadata.create_all(db_engine)
