from __future__ import annotations
from typing import TYPE_CHECKING

from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import Integer, ForeignKey, DOUBLE_PRECISION

from db.based import Base, CommonColumnsMixin

if TYPE_CHECKING:
    from .user import User


class WeightHistory(CommonColumnsMixin, Base):
    __tablename__ = "weight_history"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    weight: Mapped[float] = mapped_column(DOUBLE_PRECISION)

    user: Mapped[User] = relationship(back_populates="weight_history")

    def __repr__(self) -> str:
        return f"UserWeight: {self.user_id}, Weight: {self.weight}"
