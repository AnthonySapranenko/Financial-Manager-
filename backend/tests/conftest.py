import pytest
from sqlmodel import Session, create_engine

from app.database import create_db_and_tables


@pytest.fixture
def engine():
    """A brand-new in-memory database for each test."""
    test_engine = create_engine("sqlite://")
    create_db_and_tables(test_engine)
    return test_engine


@pytest.fixture
def session(engine):
    with Session(engine) as session:
        yield session
