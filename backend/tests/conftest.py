import pytest
from datetime import datetime, timezone, timedelta

from alembic.config import Config
from alembic import command
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from fastapi.testclient import TestClient
from core.rate_limit import limiter

from sqlalchemy_utils import create_database, database_exists, drop_database
from main import app
from db.dependency import get_db
from db.based import Base
from core.config import settings
from core.security import create_access_token, create_refresh_token, hash_password

# Use a separate test database — appends "_test" to the DB name
TEST_DATABASE_URL = str(settings.DATABASE_URL).replace(
    str(settings.DATABASE_URL.path), str(settings.DATABASE_URL.path) + "_test"
)

test_engine = create_engine(TEST_DATABASE_URL)
TestSession = sessionmaker(bind=test_engine)


@pytest.fixture(scope="session", autouse=True)
def setup_test_db(monkeypatch_session):
    """Create test database via Alembic migrations at start, drop at end."""
    if not database_exists(test_engine.url):
        create_database(test_engine.url)

    # Override so env.py's settings.DATABASE_URL points to the test DB
    monkeypatch_session.setenv("DATABASE_URL", TEST_DATABASE_URL)

    alembic_cfg = Config("alembic.ini")
    command.upgrade(alembic_cfg, "head")

    yield

    test_engine.dispose()
    drop_database(test_engine.url)


@pytest.fixture(scope="session")
def monkeypatch_session():
    """Session-scoped monkeypatch."""
    from _pytest.monkeypatch import MonkeyPatch

    mp = MonkeyPatch()
    yield mp
    mp.undo()


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


# ── User helpers ─────────────────────────────────────────────────────────────


@pytest.fixture
def registered_user(client, db_session):
    """Creates a user via the register endpoint and returns (username, password)."""
    username = "testuser"
    password = "TestPass1!"
    client.post("/api/v1/register", json={"username": username, "password": password})
    return username, password


@pytest.fixture
def auth_headers(client, registered_user):
    """Logs in as the registered user and returns {"Authorization": "Bearer <token>"}."""
    username, password = registered_user
    response = client.post(
        "/api/v1/token",
        data={"username": username, "password": password},
    )
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def second_user(client, db_session):
    """Creates a second user and returns (username, password)."""
    username = "testuser2"
    password = "TestPass2!"
    client.post("/api/v1/register", json={"username": username, "password": password})
    return username, password


@pytest.fixture
def second_auth_headers(client, second_user):
    """Returns auth headers for the second user."""
    username, password = second_user
    response = client.post(
        "/api/v1/token",
        data={"username": username, "password": password},
    )
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def oauth_user(db_session):
    """Creates an OAuth user directly in the DB (no username/password). Returns user_id."""
    from db.schemas.user import User
    from db.schemas.roles import RolesSchema, RolesEnum
    from db.schemas.oauth_users import OAuthUser

    user = User(
        username=None, hashed_password=None, role=RolesSchema(role_type=RolesEnum.USER)
    )
    db_session.add(user)
    db_session.flush()

    oauth = OAuthUser(
        provider="google",
        provider_user_id="google-sub-123",
        user_id=user.id,
        email="oauth@test.com",
    )
    db_session.add(oauth)
    db_session.flush()
    return user.id


@pytest.fixture
def oauth_auth_headers(oauth_user):
    """Returns auth headers for the OAuth user."""
    token = create_access_token(user_id=oauth_user, role="user")
    return {"Authorization": f"Bearer {token}"}


# ── Token helpers ────────────────────────────────────────────────────────────


def make_expired_access_token(user_id: int, role: str = "user") -> str:
    """Creates an access token that expired 1 hour ago."""
    return create_access_token(
        user_id=user_id, role=role, expires_delta=timedelta(seconds=-3600)
    )


# ── Food / Meal seed data ───────────────────────────────────────────────────


@pytest.fixture
def seed_food(db_session):
    """Inserts a food item + measurement unit + join row for meal tests. Returns (food_code, mida_id, mishkal)."""
    from db.schemas.moh_mitzrachim import MohMitzrachim
    from db.schemas.moh_yehidot_mida import YehidotMida
    from db.schemas.moh_yehidot_mida_lemitzrachim import YehidotMidaLemitzrachim

    food = MohMitzrachim(
        code=9999,
        smlmitzrach=1,
        search_name="test apple",
        shmmitzrach="Test Apple",
        protein=0.3,
        total_fat=0.2,
        carbohydrates=14.0,
        food_energy=52,
        alcohol=0.0,
    )
    db_session.add(food)

    mida = db_session.get(YehidotMida, 1)
    if not mida:
        mida = YehidotMida(smlmida=1, shmmida="unit")
        db_session.add(mida)

    db_session.flush()

    join_row = YehidotMidaLemitzrachim(mmitzrach=9999, mida=1, mishkal=100.0)
    db_session.add(join_row)
    db_session.flush()

    return 9999, 1, 100.0


@pytest.fixture(autouse=True)
def disable_rate_limit():
    limiter.enabled = False
    yield
    limiter.enabled = True
