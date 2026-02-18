from typing import Annotated
from pydantic import BaseModel, Field, AfterValidator


def is_good_password(password: str):
    """Checks if the password is good enough by making sure it follows the standard rules for passwords."""
    digits: int = 0
    special: int = 0

    for c in password:
        if c.isdigit():
            digits += 1
        elif not c.isalnum():
            special += 1
    if not digits:
        raise ValueError("password doesn't have numbers")
    elif not special:
        raise ValueError("password doesn't have special characters")
    elif len(password) < 8:
        raise ValueError("password must be atleast 8 characters long")
    return password


class UserRegister(BaseModel):
    """
    A Model to create valid user in our database  with a valid username and password.
    Used wants to register (regularly via the /register endpoint)

    Expected to receieve a username that is not already in the database,
    and a valid username (minimum 8 characters, 1 special character, 1 digit)
    """
    username: str = Field(min_length=2, max_length=16)
    password: Annotated[str, AfterValidator(is_good_password)]
