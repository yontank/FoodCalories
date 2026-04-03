from typing import Annotated

import jwt
from fastapi import (
    APIRouter,
    Cookie,
    Depends,
    HTTPException,
    Request,
    Response,
    status,
)
from fastapi.responses import JSONResponse
from fastapi.security import (
    OAuth2PasswordBearer,
    OAuth2PasswordRequestForm,
)
from sqlalchemy import delete, false, select, update
from core.rate_limit import limiter
from db.schemas.oauth_users import OAuthUser
from db.session import session
from models.api_error_model import Message
from models.oauth import GoogleAuthRequest
from models.tokens import JWTAccessBase, LoginTokenResponse
from models.user import ChangePassword, UserRegister
from db.schemas import User as UserDB
from db.schemas.refresh_tokens import RefreshTokens
from db.schemas.roles import RolesEnum, RolesSchema
from db.schemas.user import User
from core.config import settings
from core.security import *
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

router = APIRouter(tags=["Authentication"])

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="api/v1/token", refreshUrl="api/v1/refresh"
)


@router.post(
    "/register",
    status_code=status.HTTP_201_CREATED,
    response_model=None,
    responses={409: {"model": Message}},
)
@limiter.limit("10/minute")
async def register(request: Request, user: UserRegister):
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
async def get_current_user(
    request: Request, token: Annotated[str, Depends(oauth2_scheme)]
):
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
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
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

    issue_refresh_token(user_id=db_user.id, response=response, db=session)
    session.commit()

    return LoginTokenResponse(access_token=access_token)


@router.post(path="/logout", status_code=204, responses={})
@limiter.limit("10/minute")
async def logout(
    request: Request, model: Annotated[JWTAccessBase, Depends(get_current_user)]
) -> None:
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
    request: Request,
    response: Response,
    refresh_token: str = Cookie(..., include_in_schema=False),
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

        issue_refresh_token(user_id=result.user_id, response=response, db=session)
        session.commit()

        access_token: str = create_access_token(
            user_id=result.user_id, role=RolesEnum.USER
        )

        return LoginTokenResponse(access_token=access_token)

    except jwt.exceptions.PyJWTError:
        return JSONResponse(status_code=403, content="noun")


@router.put(
    "/user/password",
    status_code=status.HTTP_204_NO_CONTENT,
    responses={401: {"model": Message}, 400: {"model": Message}},
)
@limiter.limit("10/minute")
async def change_password(
    request: Request,
    body: ChangePassword,
    current_user: Annotated[JWTAccessBase, Depends(get_current_user)],
):
    """Changes the password for the currently authenticated user."""

    db_user = session.execute(
        select(User).where(User.id == current_user.sub)
    ).scalar_one()

    if db_user.hashed_password is None or db_user.username is None:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content="OAuth users cannot change password",
        )

    if not verify_password(body.current_password, str(db_user.hashed_password)):
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content="Current password is incorrect",
        )

    db_user.hashed_password = hash_password(body.new_password)
    revoke_all_user_refresh_tokens(current_user.sub, session)
    session.commit()


@router.delete(
    "/user",
    status_code=status.HTTP_204_NO_CONTENT,
    responses={401: {"model": Message}},
)
@limiter.limit("10/minute")
async def delete_user(
    request: Request,
    current_user: Annotated[JWTAccessBase, Depends(get_current_user)],
):
    """Deletes the current user along with all their meals, refresh tokens, and role"""
    user_id = current_user.sub

    session.execute(delete(User).where(User.id == user_id))

    session.commit()


## Google JWT Login Endpoints
@router.post(
    "/google-login",
    status_code=status.HTTP_200_OK,
    response_model=LoginTokenResponse,
    responses={401: {"model": Message}},
)
@limiter.limit("10/minute")
async def google_auth(request: Request, response: Response, token: GoogleAuthRequest):
    try:
        id_info = id_token.verify_oauth2_token(
            token.credential, google_requests.Request(), settings.GOOGLE_CLIENT_ID
        )

        email = id_info.get("email")
        if not email and not id_info.get("is_verified"):
            raise ValueError("Email not available in token.")

        # If the OAuth doesnt exist, add it to the OAuth table in our schemas.
        # Since the OAuth doesn't exist, we first need to create the User In our "Users" Table.
        # Then, we need to create the OAuth Row, and connect it to the user we just created.
        # Since the user for sure doesn't exist (We're not fixing the linking problem, since we won't use email providerss)
        # We will just make sure theat the user in the UsersTable is None,
        # None, making sure we NEVER link an OAuth user to an existing user,
        # since we won't use email providers,
        # and we don't want to cause any security issues.
        oauth_user = session.execute(
            select(OAuthUser).where(
                OAuthUser.provider == "google",
                OAuthUser.provider_user_id == id_info["sub"],
            )
        ).scalar_one_or_none()
        if not oauth_user:
            new_user = User(
                username=None,
                hashed_password=None,
                role=RolesSchema(role_type=RolesEnum.USER),
            )
            session.add(new_user)
            session.flush()  # To get the new user's ID

            oauth_user = OAuthUser(
                provider="google",
                provider_user_id=id_info["sub"],
                user_id=new_user.id,
                email=email,
            )
            session.add(oauth_user)
        else:
            new_user = session.execute(
                select(User).where(User.id == oauth_user.user_id)
            ).scalar_one()
        access_token = create_access_token(
            user_id=new_user.id, role=new_user.role.role_type
        )
        issue_refresh_token(user_id=new_user.id, response=response, db=session)
        session.commit()

        return LoginTokenResponse(access_token=access_token)

    except ValueError as e:
        return JSONResponse(status_code=401, content=str(e))
