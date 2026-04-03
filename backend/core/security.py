from datetime import datetime, timezone, timedelta
from uuid import UUID, uuid4

import jwt
from pwdlib import PasswordHash
from sqlalchemy import false
from sqlalchemy.orm import Session

from db.schemas.roles import RolesEnum
from db.schemas.refresh_tokens import RefreshTokens
from core.config import settings

ALGORITHM = "HS256"
DEFAULT_ACCESS_TOKEN_LIFESPAN = timedelta(minutes=30)
DEFAULT_REFRESH_TOKEN_LIFESPAN = timedelta(days=7)


ph = PasswordHash.recommended()


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Checks if two hashes are the same."""
    return ph.verify(plain_password, hashed_password)


def hash_password(password: str) -> str:
    """Hashes credentials"""
    return ph.hash(password)


def create_access_token(
    user_id: int, role: RolesEnum, expires_delta: timedelta | None = None
) -> str:
    to_encode: dict[str, str | datetime] = {}

    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)

    to_encode.update({"exp": expire})
    to_encode.update({"sub": str(user_id)})
    to_encode.update({"role": role})

    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=ALGORITHM)

    return encoded_jwt


def create_refresh_token(user_id: int, expires_delta: timedelta | None = None) -> str:
    """creates a refresh token for the user"""

    to_encode: dict[str, str | datetime | UUID] = {}
    if expires_delta:
        expire = datetime.now(tz=timezone.utc) + expires_delta
    else:
        expire = datetime.now(tz=timezone.utc) + DEFAULT_REFRESH_TOKEN_LIFESPAN

    to_encode.update({"sub": str(user_id)})
    to_encode.update({"exp": expire})
    to_encode.update({"iat": datetime.now(tz=timezone.utc)})
    to_encode.update({"jti": str(uuid4())})

    encoded_jwt: str = jwt.encode(
        payload=to_encode, key=settings.SECRET_KEY, algorithm=ALGORITHM
    )

    return encoded_jwt


def revoke_all_user_refresh_tokens(user_id: int, db: Session) -> int:
    """Revokes all active refresh tokens for a user. Returns the number of tokens revoked."""
    updated = (
        db.query(RefreshTokens)
        .filter(RefreshTokens.user_id == user_id, RefreshTokens.revoked == False)
        .update({"revoked": True})
    )
    db.commit()
    return updated


def issue_refresh_token(user_id: int, response: "Response", db: Session) -> str:
    """Revokes old refresh tokens, creates a new one, stores it in DB, and sets the cookie.

    Returns the raw refresh token string.
    """
    from fastapi import Response  # local import to avoid circular dependency

    # Revoke existing active refresh token
    old_token = (
        db.query(RefreshTokens)
        .filter(RefreshTokens.user_id == user_id, RefreshTokens.revoked == false())
        .first()
    )
    if old_token:
        old_token.revoked = True

    # Create and store new refresh token
    raw_token = create_refresh_token(user_id=user_id)
    db_token = RefreshTokens(user_id=user_id, token_hash=hash_password(raw_token))
    db.add(db_token)
    db.flush()

    if old_token:
        old_token.replaced_by_id = db_token.id

    # Set HTTP-only cookie
    response.set_cookie(
        key="refresh_token",
        value=raw_token,
        httponly=True,
        secure=True,
        samesite="strict",
        max_age=60 * 60 * 24 * 7,
        path="/",
    )

    return raw_token
