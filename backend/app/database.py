from pathlib import Path

from sqlmodel import Session, SQLModel, create_engine

import app.models  # noqa: F401  (importing registers the tables with SQLModel)

# Build the path from this file's location, so the database is always
# backend/finance.db no matter which folder the app is started from.
DATABASE_PATH = Path(__file__).resolve().parent.parent / "finance.db"

# FastAPI may handle a request on a different thread than the one that opened
# the connection; SQLite blocks that by default, so we turn the check off.
engine = create_engine(
    f"sqlite:///{DATABASE_PATH}", connect_args={"check_same_thread": False}
)


def create_db_and_tables(db_engine=engine):
    """Create any tables that don't exist yet."""
    SQLModel.metadata.create_all(db_engine)


def get_session():
    """Give one request its own database session, and close it afterwards."""
    with Session(engine) as session:
        yield session
