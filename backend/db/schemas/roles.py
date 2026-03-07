"""
    Roles for a Username, for the Schema
    To know what type of roles a user should get,
    For example: 

    User: X Should have Admin Roles,
    But Y should be regular User.
"""

import enum
from sqlalchemy import ForeignKey, Integer, Enum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from db.based import Base, CommonColumnsMixin


class RolesEnum(str, enum.Enum):
    """
    An Enum Class that should fill all the role types
    For easier time understanding what role types exist
    """

    ADMIN = "admin"
    USER = "user"


class RolesSchema(CommonColumnsMixin, Base):
    """
     Roles Schema for the databse, to know which type of roles exist in the service, and also w
    """
    __tablename__: str = "roles"
    id: Mapped[int] = mapped_column(
        Integer, autoincrement=True, primary_key=True)

    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))

    user: Mapped["User"] = (  # pyright: ignore[reportUndefinedVariable]
        # because of cycle imports Can't add User as an import.
        relationship(back_populates="role")
    )

    role_type: Mapped[RolesEnum] = mapped_column(
        Enum(RolesEnum), default=RolesEnum.USER)
