"""
This file contains the meals_eaten table, which tells which type of meal the user has eaten,
to write to the database
"""

import datetime
import enum
from typing import override

from sqlalchemy import (
    DOUBLE_PRECISION,
    TIMESTAMP,
    Enum,
    ForeignKey,
    ForeignKeyConstraint,
    SmallInteger,
    and_,
)
from sqlalchemy.orm import Mapped, foreign, mapped_column, relationship
from db.based import Base, CommonColumnsMixin

from .moh_yehidot_mida_lemitzrachim import YehidotMidaLemitzrachim
from .moh_mitzrachim import MohMitzrachim
from .moh_yehidot_mida import YehidotMida


class MealType(str, enum.Enum):
    """
    An Enum Class which is saved inside meals_eaten,
    to determine which type of meal the user has eaten while writing to the database
    """

    BREAKFAST = "breakfast"
    LUNCH = "lunch"
    DINNER = "dinner"


class MealsEaten(CommonColumnsMixin, Base):
    """
    A Valid Schema for table in the databse using SQLAlchemy,
    This table should contain the meals eaten by the user,
    using foreign keys to moh_mitrachim, to get the food information
    and to Yehidot_Mida to get the type of size of the meal.
    """

    __tablename__: str = "meals_eaten"

    __table_args__ = (
        ForeignKeyConstraint(
            ["code_id", "mida_id"],
            [
                "moh_yehidot_mida_lemitzrachim.mmitzrach",
                "moh_yehidot_mida_lemitzrachim.mida",
            ],
        ),
    )

    id: Mapped[int] = mapped_column(SmallInteger, primary_key=True)

    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    code_id: Mapped[int] = mapped_column(SmallInteger, ForeignKey(MohMitzrachim.code))
    mida_id: Mapped[int] = mapped_column(SmallInteger, ForeignKey(YehidotMida.smlmida))

    amount: Mapped[float] = mapped_column(DOUBLE_PRECISION)
    meal_type: Mapped[MealType] = mapped_column(Enum(MealType))

    date: Mapped[datetime.datetime] = mapped_column(
        TIMESTAMP(timezone=True), default=lambda: datetime.datetime.now()
    )

    code: Mapped["MohMitzrachim"] = relationship(
        "MohMitzrachim", back_populates="meals_eaten", overlaps="meal_mishkal"
    )
    mida: Mapped["YehidotMida"] = relationship(
        "YehidotMida", back_populates="meals", overlaps="meal_mishkal"
    )

    mishkal: Mapped["YehidotMidaLemitzrachim"] = relationship(
        "YehidotMidaLemitzrachim",
        uselist=False,
        # back_populates="meal_mishkal",
        viewonly=True,
        primaryjoin=and_(
            code_id == foreign(YehidotMidaLemitzrachim.mmitzrach),
            mida_id == foreign(YehidotMidaLemitzrachim.mida),
        ),
    )

    @override
    def __repr__(self) -> str:
        return f"<EATEN |meal_type:{self.meal_type},mida:{self.mida} amount:{self.amount} date:{self.date} code:{self.code}>"
