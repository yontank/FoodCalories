"""  
This file contains the meals_eaten table, which tells which type of meal the user has eaten,
to write to the database
"""
import enum
import datetime
from typing import override
from sqlalchemy import SmallInteger, DOUBLE_PRECISION, Enum, ForeignKey, TIMESTAMP
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .moh_mitzrachim import MohMitzrachim
from .moh_yehidot_mida import YehidotMida
from .based import Base, CommonColumnsMixin


class MealType(enum.Enum):
    """
    An Enum Class which is saved inside meals_eaten,
    to determine which type of meal the user has eaten while writing to the database
    """

    BREAKFAST = 0
    LUNCH = 1
    DINNER = 2


class MealsEaten(CommonColumnsMixin, Base):
    """_summary_
    A Valid Schema for table in the databse using SQLAlchemy,
    This table should contain the meals eaten by the user,
    using foreign keys to moh_mitrachim, to get the food information
    and to Yehidot_Mida to get the type of size of the meal.
    """

    __tablename__: str = 'meals_eaten'

    id: Mapped[int] = mapped_column(SmallInteger, primary_key=True)

    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    code_id: Mapped[int] = mapped_column(
        SmallInteger, ForeignKey(MohMitzrachim.code))
    mida_id: Mapped[int] = mapped_column(
        SmallInteger, ForeignKey(YehidotMida.smlmida))

    amount: Mapped[float] = mapped_column(DOUBLE_PRECISION)
    meal_type: Mapped[int] = mapped_column(Enum(MealType))

    date: Mapped[datetime.datetime] = mapped_column(TIMESTAMP(
        timezone=True), default=datetime.datetime.now())

    code: Mapped[str] = relationship(
        'MohMitzrachim', back_populates='meals_eaten')
    mida: Mapped[float] = relationship('YehidotMida', back_populates='mida')

    @override
    def __repr__(self) -> str:
        return f'<EATEN |meal_type:{self.meal_type},mida:{self.mida} amount:{self.amount} date:{self.date} code:{self.code}>'
