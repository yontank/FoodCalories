import os
from datetime import datetime, timedelta, timezone
from typing import Annotated
from uuid import UUID, uuid4

import jwt
from fastapi import APIRouter, Cookie, Depends, HTTPException, Request, Response, status
from fastapi.responses import JSONResponse
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pwdlib import PasswordHash
from sqlalchemy import false, select, update
from core.rate_limit import limiter
from db.session import session
from models.api_error_model import Message
from models.tokens import JWTAccessBase, LoginTokenResponse
from models.user import UserRegister
from db.schemas import User as UserDB
from db.schemas.refresh_tokens import RefreshTokens
from db.schemas.roles import RolesEnum, RolesSchema
from db.schemas.user import User
from core.config import settings
from core.security import *

router = APIRouter()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/v1/token", refreshUrl="api/v1/refresh")

@router.post(
    "/register",
    status_code=status.HTTP_201_CREATED,
    response_model=None,
    responses={409: {"model": Message}},
)
@limiter.limit("10/minute")
async def register(request : Request , user: UserRegister):
    """
    given a username and password, creates a new user inside the database
    if the user doesn't already exist inside our databse, we'd like to create one for the client
    so he can access the service
    """

    username_exists: int | None = session.execute(
        select(User.id).where(User.username == user.username)
    ).scalar()

    if username_exists:
        return JSONResponse(
            status_code=status.HTTP_409_CONFLICT, content="username is already taken"
        )

    hashed_password = hash_password(user.password)

    new_role = RolesSchema(role_type=RolesEnum.USER)

    session.add(
        User(username=user.username, hashed_password=hashed_password, role=new_role)
    )
    session.commit()


@router.get(
    "/currentUser", responses={401: {"model": Message}}, response_model=JWTAccessBase
)

@limiter.limit("10/minute")
async def get_current_user(request: Request, token: Annotated[str, Depends(oauth2_scheme)]):
    """
    returns the current user after being logged with an JWT access token.
    should return the a user id, and its role.

    if the user isn't authenticated, it'll return 401
    """
    http_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Not authenticated",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        jwt_token = jwt.decode(token, settings.SECRET_KEY, algorithms=[ALGORITHM])

        user_id: str | None = jwt_token.get("sub")
        if not user_id:
            return http_exception

        # FIXME: Do we really need to check the DB if we got a valid JWT?
        user: UserDB | None = (
            session.query(UserDB).filter(UserDB.id == int(user_id)).first()
        )

    except jwt.exceptions.PyJWTError:
        raise http_exception

    if not user:
        raise http_exception
    if user.disabled:
        raise HTTPException(status_code=401, detail="Disabled User")

    return JWTAccessBase(sub=user.id, role=user.role.role_type)


# LOGIN ENDPOINTS WITH JWT


@router.post(
    "/token", responses={401: {"model": Message}}, response_model=LoginTokenResponse
)

@limiter.limit("10/minute")
async def login(
    request: Request,
    response: Response,
      form_data: Annotated[OAuth2PasswordRequestForm, Depends()]
):
    """
    Login Endpoint for users to the service,
    to be able to get both the refresh token and access token.

    returns forbidden HTTP if the credentials doesn't exist.
    """
    http_exception = JSONResponse(
        status_code=status.HTTP_401_UNAUTHORIZED, content="Invalid username or password"
    )

    db_user = (
        session.query(UserDB).filter(UserDB.username == form_data.username).first()
    )

    if not db_user:
        return http_exception

    if not verify_password(form_data.password, str(db_user.hashed_password)):
        return http_exception

    access_token = create_access_token(
        user_id=db_user.id,
        role=db_user.role.role_type,
    )

    db_old_rtoken = session.execute(
        select(RefreshTokens).where(
            RefreshTokens.user_id == db_user.id, RefreshTokens.revoked == false()
        )
    ).scalar_one_or_none()

    if db_old_rtoken:
        db_old_rtoken.revoked = True

    r_token = create_refresh_token(user_id=db_user.id)

    # NOTE: WE STILL HAE THINGS TO DO!
    # 1) Make all older Refresh tokens of the user revoked.
    # 2) Set the new refresh token we just created at the DB, and set it as revoked=False.

    # Set refresh token as secure HTTP-only cookie
    response.set_cookie(
        key="refresh_token",
        value=r_token,
        httponly=True,  # prevents JS access (XSS protection)
        secure=True,  # HTTPS only (set False in local dev if needed)
        samesite="strict",  # CSRF protection ("lax" if needed)
        # 7 days (adjust to your refresh token lifespan)
        max_age=60 * 60 * 24 * 7,
        path="/",
    )

    # Put the refresh token inside the database.
    db_rtoken = RefreshTokens(user_id=db_user.id, token_hash=hash_password(r_token))
    session.add(db_rtoken)

    session.flush()

    if db_old_rtoken:
        db_old_rtoken.replaced_by_id = db_rtoken.id

    session.commit()

    return LoginTokenResponse(access_token=access_token)


@router.post(path="/logout", status_code=204, responses={})
@limiter.limit("10/minute")
async def logout(request: Request, model: Annotated[JWTAccessBase, Depends(get_current_user)]) -> None:
    # Check that the user is logged on (Should happen with Depends)
    # If the user is logged on, simply remoe his access token
    # revoke ALL refresh tokens created by the user.

    user_id = session.execute(select(User.id).where(User.id == model.sub)).scalar_one()
    _ = session.execute(
        update(RefreshTokens)
        .where(RefreshTokens.user_id == user_id, RefreshTokens.revoked == False)
        .values(revoked=True)
    )

    session.commit()


@router.post(
    path="/refresh",
    status_code=status.HTTP_200_OK,
    response_model=LoginTokenResponse,
    responses={403: {"model": Message}},
)
async def refresh(
    request : Request, 
    response: Response, refresh_token: str = Cookie(..., include_in_schema=False)
):
    """
    returns a new access token to the user after it's expired using the refresh_token.
    the access token will be received in the response.
    """
    # NOTE: All of this should happen without the user having to do anything.
    # NOTE 2: the refrsh_token rotation should happen in a different function, since both login AND refresh use it.

    # 1) Check Inside the databse that we made this refresh token
    #   1.1)  if its not validated, revoke all refresh tokens of the user,
    #         and let them know someone is tryingg to access their token?
    # 2) after it's validated, create a new refresh token, mnaking this one revoked (token rotation)
    # 3) create a new access_token for the user, to log in to the services.
    # 4) return both tokens to the user.

    try:
        token_payload = jwt.decode(refresh_token, settings.SECRET_KEY, ALGORITHM)

        user_id: str | None = token_payload.get("sub")

        if not user_id:
            return JSONResponse(status_code=403, content="not a valid refresh token")

        stmt = (
            select(RefreshTokens)
            .join(User)
            .where(User.id == user_id)
            .where(RefreshTokens.revoked == false())
            .where(RefreshTokens.user_id == User.id)
        )

        result = session.execute(stmt).scalar_one_or_none()

        if not result:
            return JSONResponse(status_code=403, content="not a valid refresh token")

        # Check if the hash is the same between the current hash and our given refresh_token
        if not verify_password(refresh_token, result.token_hash):
            # Security Check, compare between given refresh_token,
            # and the one we sent for this user through our DB.

            # FIXME: Change all refresh tokens to revoked, if we're here it means someone tried to use an older refresh token on the user.

            return JSONResponse(status_code=403, content="not a valid refresh token")

        result.revoked = True
        new_refresh_token = create_refresh_token(result.user_id)

        db_new_refresh_token = RefreshTokens(
            user_id=result.user_id, token_hash=hash_password(new_refresh_token)
        )
        session.add(db_new_refresh_token)
        session.flush()

        result.replaced_by_id = db_new_refresh_token.id

        session.commit()

        response.set_cookie("refresh_token", new_refresh_token)
        access_token: str = create_access_token(
            user_id=result.user_id, role=RolesEnum.USER
        )

        return LoginTokenResponse(access_token=access_token)

    except jwt.exceptions.PyJWTError:
        return JSONResponse(status_code=403, content="noun")
