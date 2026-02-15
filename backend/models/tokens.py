from datetime import datetime
from uuid import uuid4
from pydantic import UUID4, BaseModel, Field


# FIXME: HOW DO I USE THIS???

class JWTAccessBase(BaseModel):
    """
    A pydantic model for FASTAPI endpoints that contains the credential parts of the access token
    """
    sub: str = Field()
    role: str = Field(pattern=r"[a-z]+")


class FullAccessJWT(JWTAccessBase):
    """
    all access_token 
    """
    exp: datetime


class JWTRefreshBase(BaseModel):
    """
    A Pydantic model for FastAPI that contains all payload information inside a refresh token
    """

    sub: str = Field()
    exp: datetime
    iat: datetime
    jti: UUID4 = Field(default=uuid4())
