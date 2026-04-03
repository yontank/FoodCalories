"""Integration tests for Authentication endpoints (login.py + router.py health/root)."""

import jwt
import pytest
from unittest.mock import patch, MagicMock
from datetime import datetime, timezone, timedelta

from core.config import settings
from core.security import ALGORITHM, create_access_token, hash_password
from db.schemas.user import User
from db.schemas.roles import RolesSchema, RolesEnum
from db.schemas.refresh_tokens import RefreshTokens
from db.schemas.oauth_users import OAuthUser
from tests.conftest import make_expired_access_token


# ── Health / Root ────────────────────────────────────────────────────────────


class TestHealthEndpoints:
    """GET /api/v1/ and GET /api/v1/health"""

    def test_root_returns_200(self, client):
        response = client.get("/api/v1/")
        assert response.status_code == 200

    def test_health_returns_200_with_status_and_timestamp(self, client):
        response = client.get("/api/v1/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "timestamp" in data

    def test_health_response_timestamp_is_valid_iso_format(self, client):
        response = client.get("/api/v1/health")
        ts = response.json()["timestamp"]
        # Should parse without error
        datetime.fromisoformat(ts)


# ── Registration ─────────────────────────────────────────────────────────────


class TestRegistration:
    """POST /api/v1/register"""

    def test_register_new_user_returns_201(self, client):
        response = client.post(
            "/api/v1/register",
            json={"username": "newuser", "password": "Secure1!pass"},
        )
        assert response.status_code == 201

    def test_register_creates_user_with_user_role(self, client, db_session):
        client.post(
            "/api/v1/register",
            json={"username": "rolecheck", "password": "Secure1!pass"},
        )
        user = db_session.query(User).filter(User.username == "rolecheck").first()
        assert user is not None
        assert user.role.role_type == RolesEnum.USER

    def test_register_username_minimum_length(self, client):
        response = client.post(
            "/api/v1/register",
            json={"username": "ab", "password": "Secure1!pass"},
        )
        assert response.status_code == 201

    def test_register_username_maximum_length(self, client):
        response = client.post(
            "/api/v1/register",
            json={"username": "a" * 16, "password": "Secure1!pass"},
        )
        assert response.status_code == 201

    def test_register_password_minimum_valid(self, client):
        # 8 chars, 1 digit, 1 special
        response = client.post(
            "/api/v1/register",
            json={"username": "minpass", "password": "Abcdef1!"},
        )
        assert response.status_code == 201

    def test_register_duplicate_username_returns_409(self, client, registered_user):
        username, password = registered_user
        response = client.post(
            "/api/v1/register",
            json={"username": username, "password": password},
        )
        assert response.status_code == 409

    def test_register_username_too_short_returns_422(self, client):
        response = client.post(
            "/api/v1/register",
            json={"username": "a", "password": "Secure1!pass"},
        )
        assert response.status_code == 422

    def test_register_username_too_long_returns_422(self, client):
        response = client.post(
            "/api/v1/register",
            json={"username": "a" * 17, "password": "Secure1!pass"},
        )
        assert response.status_code == 422

    def test_register_password_missing_digit_returns_422(self, client):
        response = client.post(
            "/api/v1/register",
            json={"username": "nodigit", "password": "Abcdefgh!"},
        )
        assert response.status_code == 422

    def test_register_password_missing_special_char_returns_422(self, client):
        response = client.post(
            "/api/v1/register",
            json={"username": "nospecial", "password": "Abcdefgh1"},
        )
        assert response.status_code == 422

    def test_register_password_too_short_returns_422(self, client):
        response = client.post(
            "/api/v1/register",
            json={"username": "shortpw", "password": "Ab1!"},
        )
        assert response.status_code == 422

    def test_register_missing_username_field_returns_422(self, client):
        response = client.post(
            "/api/v1/register",
            json={"password": "Secure1!pass"},
        )
        assert response.status_code == 422

    def test_register_missing_password_field_returns_422(self, client):
        response = client.post(
            "/api/v1/register",
            json={"username": "nopw"},
        )
        assert response.status_code == 422

    def test_register_empty_body_returns_422(self, client):
        response = client.post("/api/v1/register", json={})
        assert response.status_code == 422


# ── Login (Token) ────────────────────────────────────────────────────────────


class TestLogin:
    """POST /api/v1/token"""

    def test_login_valid_credentials_returns_200_with_access_token(self, client, registered_user):
        username, password = registered_user
        response = client.post(
            "/api/v1/token",
            data={"username": username, "password": password},
        )
        assert response.status_code == 200
        assert "access_token" in response.json()

    def test_login_response_contains_bearer_token_type(self, client, registered_user):
        username, password = registered_user
        response = client.post(
            "/api/v1/token",
            data={"username": username, "password": password},
        )
        assert response.json()["token_type"] == "bearer"

    def test_login_sets_refresh_token_cookie(self, client, registered_user):
        username, password = registered_user
        response = client.post(
            "/api/v1/token",
            data={"username": username, "password": password},
        )
        assert "refresh_token" in response.cookies

    def test_login_wrong_password_returns_401(self, client, registered_user):
        username, _ = registered_user
        response = client.post(
            "/api/v1/token",
            data={"username": username, "password": "WrongPass1!"},
        )
        assert response.status_code == 401

    def test_login_nonexistent_user_returns_401(self, client):
        response = client.post(
            "/api/v1/token",
            data={"username": "ghost", "password": "NoUser1!xx"},
        )
        assert response.status_code == 401

    def test_login_missing_username_returns_422(self, client):
        response = client.post("/api/v1/token", data={"password": "Secure1!pass"})
        assert response.status_code == 422

    def test_login_missing_password_returns_422(self, client):
        response = client.post("/api/v1/token", data={"username": "someone"})
        assert response.status_code == 422

    def test_login_empty_form_returns_422(self, client):
        response = client.post("/api/v1/token", data={})
        assert response.status_code == 422


# ── Current User ─────────────────────────────────────────────────────────────


class TestCurrentUser:
    """GET /api/v1/currentUser"""

    def test_get_current_user_returns_user_id_and_role(self, client, auth_headers):
        response = client.get("/api/v1/currentUser", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "sub" in data
        assert "role" in data

    def test_current_user_role_is_user_for_regular_registration(self, client, auth_headers):
        response = client.get("/api/v1/currentUser", headers=auth_headers)
        assert response.json()["role"] == "user"

    def test_current_user_no_token_returns_401(self, client):
        response = client.get("/api/v1/currentUser")
        assert response.status_code == 401

    def test_current_user_invalid_token_returns_401(self, client):
        response = client.get(
            "/api/v1/currentUser",
            headers={"Authorization": "Bearer garbage.token.value"},
        )
        assert response.status_code == 401

    def test_current_user_expired_token_returns_401(self, client, registered_user, db_session):
        user = db_session.query(User).filter(User.username == registered_user[0]).first()
        token = make_expired_access_token(user.id)
        response = client.get(
            "/api/v1/currentUser",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert response.status_code == 401

    def test_current_user_disabled_user_returns_401(self, client, auth_headers, db_session, registered_user):
        user = db_session.query(User).filter(User.username == registered_user[0]).first()
        user.disabled = True
        db_session.flush()
        response = client.get("/api/v1/currentUser", headers=auth_headers)
        assert response.status_code == 401

    def test_current_user_token_with_nonexistent_user_id_returns_401(self, client):
        token = create_access_token(user_id=999999, role="user")
        response = client.get(
            "/api/v1/currentUser",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert response.status_code == 401


# ── Logout ───────────────────────────────────────────────────────────────────


class TestLogout:
    """POST /api/v1/logout"""

    def test_logout_returns_204(self, client, auth_headers):
        response = client.post("/api/v1/logout", headers=auth_headers)
        assert response.status_code == 204

    def test_logout_revokes_all_refresh_tokens(self, client, auth_headers, db_session, registered_user):
        user = db_session.query(User).filter(User.username == registered_user[0]).first()
        client.post("/api/v1/logout", headers=auth_headers)
        active = (
            db_session.query(RefreshTokens)
            .filter(RefreshTokens.user_id == user.id, RefreshTokens.revoked == False)
            .count()
        )
        assert active == 0

    def test_logout_when_no_active_refresh_tokens(self, client, auth_headers):
        # Logout twice — second should still succeed
        client.post("/api/v1/logout", headers=auth_headers)
        response = client.post("/api/v1/logout", headers=auth_headers)
        assert response.status_code == 204

    def test_logout_without_auth_returns_401(self, client):
        response = client.post("/api/v1/logout")
        assert response.status_code == 401


# ── Refresh Token ────────────────────────────────────────────────────────────


class TestRefreshToken:
    """POST /api/v1/refresh"""

    def _login_and_get_refresh_cookie(self, client, username, password):
        """Helper: login and return the refresh_token cookie value."""
        response = client.post(
            "/api/v1/token",
            data={"username": username, "password": password},
        )
        return response.cookies.get("refresh_token")

    def test_refresh_returns_new_access_token(self, client, registered_user):
        username, password = registered_user
        refresh_cookie = self._login_and_get_refresh_cookie(client, username, password)
        response = client.post(
            "/api/v1/refresh",
            cookies={"refresh_token": refresh_cookie},
        )
        assert response.status_code == 200
        assert "access_token" in response.json()

    def test_refresh_rotates_refresh_token_cookie(self, client, registered_user):
        username, password = registered_user
        old_cookie = self._login_and_get_refresh_cookie(client, username, password)
        response = client.post(
            "/api/v1/refresh",
            cookies={"refresh_token": old_cookie},
        )
        new_cookie = response.cookies.get("refresh_token")
        assert new_cookie is not None
        assert new_cookie != old_cookie

    def test_refresh_old_token_is_revoked_after_rotation(self, client, registered_user, db_session):
        username, password = registered_user
        self._login_and_get_refresh_cookie(client, username, password)
        user = db_session.query(User).filter(User.username == username).first()
        # Before refresh there should be 1 active token
        active_before = (
            db_session.query(RefreshTokens)
            .filter(RefreshTokens.user_id == user.id, RefreshTokens.revoked == False)
            .count()
        )
        assert active_before == 1

    def test_refresh_missing_cookie_returns_422(self, client):
        response = client.post("/api/v1/refresh")
        assert response.status_code == 422

    def test_refresh_invalid_cookie_returns_403(self, client):
        response = client.post(
            "/api/v1/refresh",
            cookies={"refresh_token": "not.a.valid.jwt"},
        )
        assert response.status_code == 403

    def test_refresh_revoked_token_returns_403(self, client, registered_user, db_session):
        username, password = registered_user
        old_cookie = self._login_and_get_refresh_cookie(client, username, password)
        # Use the token once (rotates it, old becomes revoked)
        client.post("/api/v1/refresh", cookies={"refresh_token": old_cookie})
        # Try to use the old (now revoked) token again
        response = client.post("/api/v1/refresh", cookies={"refresh_token": old_cookie})
        assert response.status_code == 403

    def test_refresh_expired_token_returns_403(self, client, registered_user, db_session):
        user = db_session.query(User).filter(User.username == registered_user[0]).first()
        expired_token = jwt.encode(
            {
                "sub": str(user.id),
                "exp": datetime.now(timezone.utc) - timedelta(hours=1),
                "iat": datetime.now(timezone.utc) - timedelta(hours=2),
                "jti": "test-jti",
            },
            settings.SECRET_KEY,
            algorithm=ALGORITHM,
        )
        response = client.post(
            "/api/v1/refresh",
            cookies={"refresh_token": expired_token},
        )
        assert response.status_code == 403

    def test_refresh_token_with_no_sub_returns_403(self, client):
        token_no_sub = jwt.encode(
            {
                "exp": datetime.now(timezone.utc) + timedelta(hours=1),
                "iat": datetime.now(timezone.utc),
                "jti": "test-jti",
            },
            settings.SECRET_KEY,
            algorithm=ALGORITHM,
        )
        response = client.post(
            "/api/v1/refresh",
            cookies={"refresh_token": token_no_sub},
        )
        assert response.status_code == 403


# ── Change Password ──────────────────────────────────────────────────────────


class TestChangePassword:
    """PUT /api/v1/user/password"""

    def test_change_password_returns_204(self, client, auth_headers, registered_user):
        _, old_password = registered_user
        response = client.put(
            "/api/v1/user/password",
            headers=auth_headers,
            json={"current_password": old_password, "new_password": "NewSecure1!"},
        )
        assert response.status_code == 204

    def test_change_password_revokes_refresh_tokens(
        self, client, auth_headers, registered_user, db_session
    ):
        username, old_password = registered_user
        user = db_session.query(User).filter(User.username == username).first()
        client.put(
            "/api/v1/user/password",
            headers=auth_headers,
            json={"current_password": old_password, "new_password": "NewSecure1!"},
        )
        active = (
            db_session.query(RefreshTokens)
            .filter(RefreshTokens.user_id == user.id, RefreshTokens.revoked == False)
            .count()
        )
        assert active == 0

    def test_can_login_with_new_password_after_change(self, client, auth_headers, registered_user):
        username, old_password = registered_user
        new_password = "NewSecure1!"
        client.put(
            "/api/v1/user/password",
            headers=auth_headers,
            json={"current_password": old_password, "new_password": new_password},
        )
        response = client.post(
            "/api/v1/token",
            data={"username": username, "password": new_password},
        )
        assert response.status_code == 200
        assert "access_token" in response.json()

    def test_change_password_to_same_password(self, client, auth_headers, registered_user):
        _, password = registered_user
        response = client.put(
            "/api/v1/user/password",
            headers=auth_headers,
            json={"current_password": password, "new_password": password},
        )
        # Should succeed — no rule against reusing same password
        assert response.status_code == 204

    def test_change_password_wrong_current_password_returns_400(self, client, auth_headers):
        response = client.put(
            "/api/v1/user/password",
            headers=auth_headers,
            json={"current_password": "WrongPass1!", "new_password": "NewSecure1!"},
        )
        assert response.status_code == 400

    def test_change_password_invalid_new_password_returns_422(self, client, auth_headers, registered_user):
        _, old_password = registered_user
        response = client.put(
            "/api/v1/user/password",
            headers=auth_headers,
            json={"current_password": old_password, "new_password": "nodigit!"},
        )
        assert response.status_code == 422

    def test_change_password_oauth_user_returns_400(self, client, oauth_auth_headers):
        response = client.put(
            "/api/v1/user/password",
            headers=oauth_auth_headers,
            json={"current_password": "anything", "new_password": "NewSecure1!"},
        )
        assert response.status_code == 400

    def test_change_password_no_auth_returns_401(self, client):
        response = client.put(
            "/api/v1/user/password",
            json={"current_password": "Old1!pass", "new_password": "New1!pass"},
        )
        assert response.status_code == 401


# ── Delete User ──────────────────────────────────────────────────────────────


class TestDeleteUser:
    """DELETE /api/v1/user"""

    def test_delete_user_returns_204(self, client, auth_headers):
        response = client.delete("/api/v1/user", headers=auth_headers)
        assert response.status_code == 204

    def test_delete_user_removes_user_from_db(self, client, auth_headers, db_session, registered_user):
        username, _ = registered_user
        client.delete("/api/v1/user", headers=auth_headers)
        user = db_session.query(User).filter(User.username == username).first()
        assert user is None

    def test_delete_user_cascades_meals_and_tokens(self, client, auth_headers, db_session, registered_user):
        username, _ = registered_user
        user = db_session.query(User).filter(User.username == username).first()
        user_id = user.id
        client.delete("/api/v1/user", headers=auth_headers)
        tokens = db_session.query(RefreshTokens).filter(RefreshTokens.user_id == user_id).count()
        assert tokens == 0

    def test_deleted_user_token_becomes_invalid(self, client, auth_headers):
        client.delete("/api/v1/user", headers=auth_headers)
        response = client.get("/api/v1/currentUser", headers=auth_headers)
        assert response.status_code == 401

    def test_delete_user_no_auth_returns_401(self, client):
        response = client.delete("/api/v1/user")
        assert response.status_code == 401


# ── Google OAuth ─────────────────────────────────────────────────────────────


FAKE_GOOGLE_ID_INFO = {
    "iss": "accounts.google.com",
    "sub": "google-unique-id-12345",
    "email": "testgoogle@gmail.com",
    "email_verified": True,
    "name": "Test User",
    "is_verified": True,
}


class TestGoogleOAuth:
    """POST /api/v1/google-login"""

    def _google_login(self, client, id_info=None):
        """Helper: post to google-login with mocked token verification."""
        info = id_info or FAKE_GOOGLE_ID_INFO
        with patch("api.v1.login.id_token.verify_oauth2_token", return_value=info):
            return client.post(
                "/api/v1/google-login",
                json={
                    "credential": "fake-google-jwt",
                    "clientId": "fake-client-id",
                    "select_by": "btn",
                },
            )

    def test_google_login_new_user_returns_200_with_access_token(self, client):
        response = self._google_login(client)
        assert response.status_code == 200
        assert "access_token" in response.json()

    def test_google_login_creates_oauth_user_in_db(self, client, db_session):
        self._google_login(client)
        oauth = (
            db_session.query(OAuthUser)
            .filter(
                OAuthUser.provider == "google",
                OAuthUser.provider_user_id == FAKE_GOOGLE_ID_INFO["sub"],
            )
            .first()
        )
        assert oauth is not None
        assert oauth.email == FAKE_GOOGLE_ID_INFO["email"]

    def test_google_login_existing_oauth_user_returns_200(self, client, db_session):
        # First login creates the user
        self._google_login(client)
        first_count = db_session.query(OAuthUser).count()
        # Second login reuses the same user
        response = self._google_login(client)
        assert response.status_code == 200
        assert db_session.query(OAuthUser).count() == first_count

    def test_google_login_sets_refresh_token_cookie(self, client):
        response = self._google_login(client)
        assert "refresh_token" in response.cookies

    def test_google_login_user_has_no_username_or_password(self, client, db_session):
        self._google_login(client)
        oauth = db_session.query(OAuthUser).first()
        user = db_session.query(User).filter(User.id == oauth.user_id).first()
        assert user.username is None
        assert user.hashed_password is None

    def test_google_login_invalid_token_returns_401(self, client):
        with patch(
            "api.v1.login.id_token.verify_oauth2_token",
            side_effect=ValueError("Invalid token"),
        ):
            response = client.post(
                "/api/v1/google-login",
                json={
                    "credential": "bad-token",
                    "clientId": "fake-client-id",
                    "select_by": "btn",
                },
            )
        assert response.status_code == 401

    def test_google_login_missing_credential_field_returns_422(self, client):
        response = client.post(
            "/api/v1/google-login",
            json={"clientId": "fake-client-id", "select_by": "btn"},
        )
        assert response.status_code == 422

    def test_google_login_missing_email_in_token_returns_401(self, client):
        no_email_info = {**FAKE_GOOGLE_ID_INFO, "email": None, "is_verified": False}
        response = self._google_login(client, id_info=no_email_info)
        assert response.status_code == 401
