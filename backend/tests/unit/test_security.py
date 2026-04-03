from core.security import (
    verify_password,
    hash_password,
    create_access_token,
    create_refresh_token,
)
from db.schemas.roles import RolesEnum
import jwt
from core.config import settings


class TestHashFunctions:
    def test_hash_password_function(self):
        password = "P4ssw@rd"

        hashed = hash_password(password)
        assert hashed != password
        assert verify_password(password, hashed) is True
        assert verify_password("wrongpassword", hashed) is False

    def test_verify_password_function(self):
        password = "P4ssw@rd"
        hashed = hash_password(password)
        assert verify_password(password, hashed) is True
        assert verify_password("an8fthrPas24ads", hashed) is False


class TestJWTAccessFunctions:

    def test_create_access_token_with_expiry(self):
        user_id, role = 1, RolesEnum.USER
        token = create_access_token(user_id=user_id, role=role)
        assert token is not None
        decoded = jwt.decode(token, key=settings.SECRET_KEY, algorithms=["HS256"])
        assert decoded["sub"] == "1"
        assert "exp" in decoded
        assert "role" in decoded
        assert decoded["role"] == role.value

    def test_create_fresh_token_with_expiry(self):
        user_id = 1
        token = create_refresh_token(user_id=user_id)
        assert token is not None
        decoded = jwt.decode(token, key=settings.SECRET_KEY, algorithms=["HS256"])
        assert decoded["sub"] == "1"
        assert "exp" in decoded
        assert "jti" in decoded
        assert "iat" in decoded
