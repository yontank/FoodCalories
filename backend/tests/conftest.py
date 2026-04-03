import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from fastapi.testclient import TestClient

from sqlalchemy_utils import create_database, database_exists, drop_database
from main import app
from db.dependency import get_db
from db.based import Base
from core.config import settings

# Use a separate test database — appends "_test" to the DB name
TEST_DATABASE_URL = str(settings.DATABASE_URL).replace(
    settings.DATABASE_URL.path, settings.DATABASE_URL.path + "_test"
)

test_engine = create_engine(TEST_DATABASE_URL)
TestSession = sessionmaker(bind=test_engine)


@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    """Create test database and tables at start, drop at end."""
    if not database_exists(test_engine.url):
        create_database(test_engine.url)
    Base.metadata.create_all(bind=test_engine)
    yield
    Base.metadata.drop_all(bind=test_engine)
    drop_database(test_engine.url)


@pytest.fixture(autouse=True)
def db_session():
    """Each test gets a rolled-back transaction — no data persists between tests."""
    connection = test_engine.connect()
    transaction = connection.begin()
    session = TestSession(bind=connection)

    def override_get_db():
        try:
            yield session
        finally:
            pass  # don't close — we rollback below

    app.dependency_overrides[get_db] = override_get_db

    yield session

    transaction.rollback()
    connection.close()
    app.dependency_overrides.clear()


@pytest.fixture
def client():
    return TestClient(app)
