from models.tokens import JWTAccessBase, LoginTokenResponse
from pydantic import ValidationError
import pytest


class TestLoginTokenResponse:
    def test_default_token_type(self):
        token = LoginTokenResponse(access_token="some_token")
        assert token.token_type == "bearer"

    def test_custom_token_type(self):
        token = LoginTokenResponse(access_token="some_token", token_type="custom")
        assert token.token_type == "custom"

    def test_missing_access_token(self):
        with pytest.raises(ValidationError):
            LoginTokenResponse()


class TestJWTAccessBase:
    def test_valid_access_base(self):
        access = JWTAccessBase(sub=1, role="user")
        assert access.sub == 1
        assert access.role == "user"

    def test_role_rejects_uppercase(self):
        with pytest.raises(ValidationError):
            JWTAccessBase(sub=1, role="ADMIN")

    def test_role_rejects_numbers(self):
        with pytest.raises(ValidationError):
            JWTAccessBase(sub=1, role="user123")

    def test_missing_sub(self):
        with pytest.raises(ValidationError):
            JWTAccessBase(role="user")

    def test_missing_role(self):
        with pytest.raises(ValidationError):
            JWTAccessBase(sub=1)
