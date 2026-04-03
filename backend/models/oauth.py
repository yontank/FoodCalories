from pydantic import BaseModel, EmailStr


class GoogleAuthRequest(BaseModel):
    """Raw response from Google Sign In button."""
    credential: str
    clientId: str
    select_by: str


class GoogleIDToken(BaseModel):
    """Decoded claims from the verified Google ID token (JWT)."""
    iss: str
    azp: str
    aud: str
    sub: str
    email: EmailStr
    email_verified: bool
    nbf: int
    name: str | None = None
    picture: str | None = None
    given_name: str | None = None
    family_name: str | None = None
    iat: int
    exp: int
    jti: str
