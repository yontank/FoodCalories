from datetime import datetime, timedelta, timezone
from typing import Annotated

from pydantic import BaseModel, Field
from pwdlib import PasswordHash
from fastapi import APIRouter, Cookie, Depends, HTTPException, Response, status
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from uuid import UUID, uuid4
import jwt
from sqlalchemy import false, select, update, values
from starlette.status import HTTP_200_OK

from backend.models.tokens import FullAccessJWT, JWTAccessBase, JWTRefreshBase
from backend.schemas.refresh_tokens import RefreshTokens
from backend.schemas.roles import RolesEnum, RolesSchema
from backend.schemas.user import User


from ..schemas import User as UserDB
from ..models.user import UserRegister
from ..db import session

router = APIRouter()
SECRET_KEY = "8e161dcfe4ebe2d055212edfb12bdfec2a0be9baca7cec5e6e21ca63787b0f8d"
ALGORITHM = "HS256"
DEFAULT_ACCESS_TOKEN_LIFESPAN = timedelta(minutes=30)
DEFAULT_REFRESH_TOKEN_LIFESPAN = timedelta(days=7)


# NOTE: MOVE THIS TO MODELS LATER!


class AccessTokenData(BaseModel):
    username: str = Field(alias="sub")
    role: RolesEnum
    exp: datetime


class RefreshTokenData(BaseModel):
    username: str


ph = PasswordHash.recommended()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="v1/token")

# HELPER FUNCTIONS


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Checks if two hashes are the same."""
    return ph.verify(plain_password, hashed_password)


def hash_password(password: str) -> str:
    """Hashes credentials"""
    return ph.hash(password)


def authenticate_user(user: UserRegister) -> UserDB | None:
    """
        a function to check if we can authenticate the user
        checks the database for the credentials we got,
        and checks if we got a hit.


    Args:
        user (UserRegister): _description_

    Returns:
        UserDB | None: _description_
    """
    db_user = session.query(UserDB).filter(
        UserDB.username == user.username).first()
    if not db_user:
        return None
    if not verify_password(user.password, str(db_user.hashed_password)):
        return None
    return db_user


def create_access_token(username: str, role: RolesEnum,
                        expires_delta: timedelta | None = None) -> str:
    to_encode: dict[str, str | datetime] = {}

    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)

    to_encode.update({"exp": expire})
    to_encode.update({"sub": username})
    to_encode.update({"role": role})

    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

    return encoded_jwt


def create_refresh_token(username: str, expires_delta: timedelta | None = None):
    """creates a refresh token for the user"""

    to_encode: dict[str, str | datetime | UUID] = {}
    if expires_delta:
        expire = datetime.now(tz=timezone.utc) + expires_delta
    else:
        expire = datetime.now(tz=timezone.utc) + DEFAULT_REFRESH_TOKEN_LIFESPAN

    to_encode.update({"sub": username})
    to_encode.update({"exp": expire})
    to_encode.update({"iat": datetime.now(tz=timezone.utc)})
    to_encode.update({"jti": str(uuid4())})

    encoded_jwt: str = jwt.encode(
        payload=to_encode, key=SECRET_KEY, algorithm=ALGORITHM)

    return encoded_jwt


@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(user: UserRegister):
    """
    Via the register endpoint,
    if the user doesn't already exist inside our databse, we'd like to create one for the client
    so he can access the service
    """

    username_exists: int | None = session.execute(select(User.id).where(
        User.username == user.username)).scalar()

    if username_exists:
        raise HTTPException(status.HTTP_409_CONFLICT,
                            "username is already taken")

    hashed_password = hash_password(user.password)

    new_role = RolesSchema(role_type=RolesEnum.USER)

    session.add(User(username=user.username,
                hashed_password=hashed_password, role=new_role))
    session.commit()


@router.get("/currentUser")
async def get_current_user(token: Annotated[str, Depends(oauth2_scheme)]):
    """
    TODO: Yes!

    Args:
        token (Annotated[str, Depends): _description_

    Raises:
        HTTPException: _description_
        HTTPException: _description_

    Returns:
        _type_: _description_
    """
    http_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Not authenticated",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        username: str | None = jwt.decode(
            token, SECRET_KEY, algorithms=[ALGORITHM]).get("sub")

        # FIXME: Do we really need to check the DB if we got a valid JWT?
        user: UserDB | None = session.query(UserDB).filter(
            UserDB.username == username).first()

    except jwt.exceptions.PyJWTError as exc:
        raise http_exception from exc

    if not user:
        raise http_exception
    if user.disabled:
        raise HTTPException(status_code=400, detail="Disabled User")

    return JWTAccessBase(sub=user.username, role=user.role.role_type)


# LOGIN ENDPOINTS WITH JWT


@router.post("/token")
async def login(response: Response, form_data: Annotated[OAuth2PasswordRequestForm, Depends()]):
    """
    Login Endpoint for users to the service,
    to be able to get both the refresh token and access token.


    Raises:
        HTTPException: _description_
        HTTPException: _description_

    Returns:
        _type_: _description_
    """

    db_user = session.query(UserDB).filter(
        UserDB.username == form_data.username).first()

    if not db_user:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED,
                            "Invalid username or password")

    if not verify_password(form_data.password, str(db_user.hashed_password)):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED,
                            "Invalid username or password")

    access_token = create_access_token(
        username=db_user.username,
        role=db_user.role.role_type,
        expires_delta=DEFAULT_ACCESS_TOKEN_LIFESPAN
    )

    db_old_rtoken = session.execute(select(RefreshTokens).where(
        RefreshTokens.user_id == db_user.id, RefreshTokens.revoked == false())).scalar_one_or_none()
    if db_old_rtoken:
        db_old_rtoken.revoked = True

    r_token = create_refresh_token(username=db_user.username)

    # NOTE: WE STILL HAE THINGS TO DO!
    # 1) Make all older Refresh tokens of the user revoked.
    # 2) Set the new refresh token we just created at the DB, and set it as revoked=False.

    # Set refresh token as secure HTTP-only cookie
    response.set_cookie(
        key="refresh_token",
        value=r_token,
        httponly=True,          # prevents JS access (XSS protection)
        secure=True,            # HTTPS only (set False in local dev if needed)
        samesite="strict",      # CSRF protection ("lax" if needed)
        # 7 days (adjust to your refresh token lifespan)
        max_age=60 * 60 * 24 * 7,
        path="/"
    )

    # Put the refresh token inside the database.
    db_rtoken = RefreshTokens(
        user_id=db_user.id, token_hash=hash_password(r_token))
    session.add(db_rtoken)

    session.flush()

    if db_old_rtoken:
        db_old_rtoken.replaced_by_id = db_rtoken.id

    session.commit()

    return {"access_token": access_token, "token_type": "bearer"}


@router.post(path="/logout", status_code=204)
async def logout(model: Annotated[JWTAccessBase, Depends(get_current_user)]):
    # Check that the user is logged on (Should happen with Depends)
    # If the user is logged on, simply remoe his access token
    # revoke ALL refresh tokens created by the user.

    user_id = session.execute(select(User.id).where(
        User.username == model.sub)).scalar_one()
    _ = session.execute(
        update(RefreshTokens).where(RefreshTokens.user_id == user_id, RefreshTokens.revoked == False).values(revoked=True))

    session.commit()


@router.post(path="/refresh", status_code=HTTP_200_OK)
async def refresh(response: Response, refresh_token: str = Cookie(...)):
    # NOTE: All of this should happen without the user having to do anything.

    # 1) Check Inside the databse that we made this refresh token
    #   1.1)  if its not validated, revoke all refresh tokens of the user, and let them know someone is tryingg to access their token?
    # 2) after it's validated, create a new refresh token, mnaking this one revoked (token rotation)
    # 3) create a new access_token for the user, to log in to the services.
    # 4) return both tokens to the user.

    try:
        token_payload = jwt.decode(refresh_token, SECRET_KEY, ALGORITHM)

        # FIXME: Check with pydantic here that the token is a valid token.

        username: str | None = token_payload.get("sub")

        if not username:
            raise HTTPException(403, "not a valid refresh token")

        # stmt = (
        #     select(RefreshTokens)
        #     .join(User)
        #     .where(User.username == username)
        #     .where(RefreshTokens.revoked == false())
        #     .where(RefreshTokens.user_id == User.id)
        # )

        # result = session.execute(stmt).scalar_one_or_none()

        # if not result:
        #     raise HTTPException(403, "not a valid refresh token")

        # if not (verify_password(refresh_token, result.token_hash)):
        #     # Security Check, check that the not revoked refresh token inside our DB is the same one we're getting right now!
        #     # FIXME: Change all refresh tokens to revoked, if we're here it means someone tried to use an older refresh token on the user.
        #     raise HTTPException(403, "not a valid refresh token")

        # result.revoked = True

        new_refresh_token = create_refresh_token(username)
        response.set_cookie("refresh_token", new_refresh_token)
        access_token: str = create_access_token(
            username=username, role=RolesEnum.USER)

        return {"access_token": access_token, "token_type": "bearer"}

    except jwt.exceptions.PyJWTError:
        raise HTTPException(403, "not a valid refresh token")
