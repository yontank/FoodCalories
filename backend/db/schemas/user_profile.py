"""Schema table for user profile information, including physical attributes and nutrition preferences."""

from __future__ import annotations
from typing import TYPE_CHECKING
from enum import Enum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import Integer, ForeignKey, DOUBLE_PRECISION, Enum as SA_Enum

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
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))

    age: Mapped[int] = mapped_column(Integer)
    height: Mapped[int] = mapped_column(Integer)  # In CM, Metric System.
    gender: Mapped[Gender] = mapped_column(SA_Enum(Gender))

    # in float. since its between 1 and 2.
    activity_factor: Mapped[float] = mapped_column(DOUBLE_PRECISION)

    # Saves Preferences of the user eating habits. we can calculate the calories from this.
    carbohydrates_g: Mapped[int] = mapped_column(Integer)
    protein_g: Mapped[int] = mapped_column(Integer)
    fat_g: Mapped[int] = mapped_column(Integer)

    # One to One RelationShip
    user: Mapped[User] = relationship(back_populates="profile")

    def __repr__(self) -> str:
        return f"UserProfile: {self.user_id}, \n Age: {self.age}, height:{self.height} "
