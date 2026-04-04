from models.user import is_good_password, UserRegister, ChangePassword
from pydantic import ValidationError
import pytest


class TestUsers:
    def test_empty_password(self):
        with pytest.raises(ValueError):
            assert is_good_password("")

    def test_short_password(self):
        with pytest.raises(ValueError):
            assert is_good_password("short")

    def test_password_without_digit(self):
        with pytest.raises(ValueError):
            assert is_good_password("password!")

    def test_password_without_special_character(self):
        with pytest.raises(ValueError):
            assert is_good_password("password123")

    def test_valid_password(self):
        assert is_good_password("P@ssw0rd123") == "P@ssw0rd123"
        assert is_good_password("Str0ngP@ss!") == "Str0ngP@ss!"
        assert is_good_password("P@ssw0rd") == "P@ssw0rd"
        assert is_good_password("password123!") == "password123!"

    def test_password_with_only_special_characters(self):
        with pytest.raises(ValueError):
            is_good_password("!@#$%^&*()")


class TestUserRegister:
    def test_valid_registration(self):
        user = UserRegister(username="testuser", password="P@ssw0rd1")
        assert user.username == "testuser"

    def test_username_too_short(self):
        with pytest.raises(ValidationError):
            UserRegister(username="a", password="P@ssw0rd1")

    def test_username_too_long(self):
        with pytest.raises(ValidationError):
            UserRegister(username="a" * 17, password="P@ssw0rd1")

    def test_invalid_password_rejected(self):
        with pytest.raises(ValidationError):
            UserRegister(username="testuser", password="nodigits!")

    def test_missing_username(self):
        with pytest.raises(ValidationError):
            UserRegister(password="P@ssw0rd1")

    def test_missing_password(self):
        with pytest.raises(ValidationError):
            UserRegister(username="testuser")


class TestChangePassword:
    def test_valid_change_password(self):
        cp = ChangePassword(current_password="old", new_password="N3wP@ss!")
        assert cp.current_password == "old"

    def test_invalid_new_password(self):
        with pytest.raises(ValidationError):
            ChangePassword(current_password="old", new_password="weak")
