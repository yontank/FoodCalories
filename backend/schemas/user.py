"""Schema table for the users in the database and application"""
from sqlalchemy import Integer, String
from sqlalchemy.orm import mapped_column, Mapped
from ..schemas.based import Base


class User(Base):
    """_summary_
    A Valid Schema for table in the databse using SQLAlchemy,
    This table should contain the users of the application, with their username and password.
    """
    __tablename__: str = "users"

    id: Mapped[int] = mapped_column(
        Integer, primary_key=True, autoincrement=True)
    username: Mapped[str] = mapped_column(
        String(50), nullable=False, unique=True)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
