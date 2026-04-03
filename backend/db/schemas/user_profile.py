"""Schema table for user profile information, including physical attributes and nutrition preferences."""

from __future__ import annotations
from typing import TYPE_CHECKING
from enum import Enum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import Integer, String, ForeignKey, DOUBLE_PRECISION, Enum as SA_Enum

from db.based import Base, CommonColumnsMixin

if TYPE_CHECKING:
    from .user import User


class Gender(str, Enum):
    """Enum representing the biological gender of a user."""

    MALE = "male"
    FEMALE = "female"


class UserProfile(CommonColumnsMixin, Base):
    """
    Stores physical and nutritional profile data for a user.
    Holds attributes like age, height, gender, activity level,
    and daily macro-nutrient targets (carbs, protein, fat).
    Has a one-to-one relationship with the User table.
    """

    __tablename__ = "user_profile"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    name_display: Mapped[str] = mapped_column(
        String(255)
    )  # Optional display name for the user profile.
    age: Mapped[int] = mapped_column(Integer)
    height: Mapped[int] = mapped_column(Integer)  # In CM, Metric System.
    gender: Mapped[Gender] = mapped_column(SA_Enum(Gender))

    activity_factor: Mapped[float] = mapped_column(DOUBLE_PRECISION)
    # One to One RelationShip
    user: Mapped[User] = relationship(back_populates="profile")

    def __repr__(self) -> str:
        return f"UserProfile: {self.user_id}, \n Age: {self.age}, height:{self.height} "
