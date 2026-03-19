"""Schema table for the users in the database and application"""

from sqlalchemy import BOOLEAN, Integer, String, false
from sqlalchemy.orm import mapped_column, Mapped, relationship

from db.based import Base, CommonColumnsMixin

from .meals_eaten import MealsEaten
from .refresh_tokens import RefreshTokens
from .roles import RolesSchema
from .weight_history import WeightHistory
from .user_profile import UserProfile
from .user_nutrition_profile import NutritionProfile


class User(CommonColumnsMixin, Base):
    """
    A Valid Schema for table in the databse using SQLAlchemy,
    This table should contain the users of the application, with their username and password.
    """

    __tablename__: str = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    username: Mapped[str] = mapped_column(String(50), nullable=False, unique=True)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)

    disabled: Mapped[bool] = mapped_column(BOOLEAN, default=false())

    # One to One Mapping with Role Schema, to know what role the user is
    role: Mapped["RolesSchema"] = relationship(back_populates="user", uselist=False)

    # One to Many Relationship with meals_eaten
    # To get the meals eaten by the user.
    meals: Mapped[list["MealsEaten"]] = relationship()

    # One To Many RelationShip with RefreshTokens Schema
    # NOTE: Some Refresh tokens for a user will be revoked!
    # in that instance, if a user asks a /refresh endpoint to refresh with an invalid refresh token
    # We should turn all the refresh tokens that the user has into revoked
    # And notify the user.
    refresh_tokens: Mapped[list["RefreshTokens"]] = relationship()

    # One to Many Relationship with WeightHistory
    weight_history: Mapped[list["WeightHistory"]] = relationship(back_populates="user")

    # One to One Relationship with UserProfile
    # Returns Profile Information of the user, like
    # his height, age, nutrition preferences, etc.

    profile: Mapped["UserProfile"] = relationship(back_populates="user")
    nutrition_settings: Mapped["NutritionProfile"] = relationship(back_populates="user")


# PARENT
