"""Initialize the Base class for SQLAlchemy models."""
from datetime import datetime, timezone
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from sqlalchemy.sql.sqltypes import DATETIME_TIMEZONE


class Base(DeclarativeBase):
    """default Base class using SQLALchemy 2.0"""


class CommonColumnsMixin:
    """
    Defines common column values inside the database 
    that i believe every column should have!
    """

    created_at: Mapped[datetime] = mapped_column(
        DATETIME_TIMEZONE, default=lambda: datetime.now(timezone.utc))

    updated_at: Mapped[datetime] = mapped_column(
        DATETIME_TIMEZONE, default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc)
    )
