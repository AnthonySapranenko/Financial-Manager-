import pytest
from fastapi.testclient import TestClient
from sqlalchemy.pool import StaticPool
from sqlmodel import Session, create_engine

from app.database import create_db_and_tables, get_session
from app.main import app


@pytest.fixture
def engine():
    """A brand-new in-memory database for each test."""
    test_engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,  # share one connection, so the in-memory data survives
    )
    create_db_and_tables(test_engine)
    return test_engine


@pytest.fixture
def session(engine):
    with Session(engine) as session:
        yield session


@pytest.fixture
def client(session):
    """An API client whose endpoints use the test database instead of finance.db."""
    app.dependency_overrides[get_session] = lambda: session
    yield TestClient(app)
    app.dependency_overrides.clear()
