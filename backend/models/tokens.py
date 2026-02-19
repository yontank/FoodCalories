from datetime import datetime
from uuid import uuid4
from pydantic import UUID4, BaseModel, Field


class JWTAccessBase(BaseModel):
    """
    A pydantic model for FASTAPI endpoints that contains the credential parts of the access token
    Whenever we receive a Access token, this are the values I expect it to contain.

    sub: the id of the username
    role: the current user role (ADMIN / USER)
    exp: the expiration date of the refresh token
    """
    sub: int = Field()
    role: str = Field(pattern=r"[a-z]+")


class FullAccessJWT(JWTAccessBase):
    """
    all access_token 
    """
    exp: datetime


class JWTRefreshBase(BaseModel):
    """
    A Pydantic model for FastAPI that contains all payload information inside a refresh token
    Whenever we receive a Refresh token, this are the values I expect it to contain.

    sub: the id of the username
    exp: the expiration date of the refresh token
    iat: the  date the token was issued
    jti: a random uuid4 token, to change the value of the base64 inside the JWT, so we can "differntiate" between different refresh tokens of the same user.
    """

    sub: str = Field()
    exp: datetime
    iat: datetime
    jti: UUID4 = Field(default=uuid4())


class LoginTokenResponse(BaseModel):
    """
    Login Response of /login endpoint,
    returns the JWT Access token and the token type.
    """

    access_token : str = Field()
    token_type : str = Field(default="bearer")

