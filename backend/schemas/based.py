"""Initialize the Base class for SQLAlchemy models."""
from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    """default Base class using SQLALchemy 2.0"""
