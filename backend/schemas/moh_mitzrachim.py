"""Schema table for the food information in the database and application"""
from datetime import datetime
from typing import override
from sqlalchemy import SmallInteger, Integer, String, DateTime, DOUBLE_PRECISION
from sqlalchemy.orm import mapped_column, relationship, Mapped
from ..schemas.based import Base
from .moh_yehidot_mida_lemitzrachim import YehidotMidaLemitzrachim
# from .meals_eaten import MealsEaten


class MohMitzrachim(Base):
    """_summary_
    A Valid Schema for table in the databse using SQLAlchemy,
    This table should contain the food information, with its id, name, and calories.
    Also, this table contains all the different nutrients of the food (as a single gram).

    for now, most variable names make sense,

    smlmitrach : i dont know what this is, im thinking its the QR bar, will check later.
    shmmitzrach: the name of the food.


    """
    __tablename__: str = "moh_mitzrachim"

    code: Mapped[int] = mapped_column(SmallInteger, primary_key=True)
    smlmitzrach: Mapped[int] = mapped_column(Integer())
    shmmitzrach: Mapped[str] = mapped_column(String(255))
    makor: Mapped[int] = mapped_column(SmallInteger())

    protein: Mapped[float] = mapped_column(DOUBLE_PRECISION)
    total_fat: Mapped[float] = mapped_column(DOUBLE_PRECISION)
    carbohydrates: Mapped[float] = mapped_column(DOUBLE_PRECISION)
    food_energy: Mapped[float] = mapped_column(SmallInteger)
    alcohol: Mapped[float] = mapped_column(DOUBLE_PRECISION)

    total_dietary_fiber: Mapped[float] = mapped_column(DOUBLE_PRECISION)
    calcium: Mapped[float] = mapped_column(DOUBLE_PRECISION)
    iron: Mapped[float] = mapped_column(DOUBLE_PRECISION)
    magnesium: Mapped[float] = mapped_column(DOUBLE_PRECISION)
    sodium: Mapped[float] = mapped_column(DOUBLE_PRECISION)
    cholesterol: Mapped[float] = mapped_column(DOUBLE_PRECISION)
    saturated_fat: Mapped[float] = mapped_column(DOUBLE_PRECISION)
    fructose: Mapped[float] = mapped_column(DOUBLE_PRECISION)

    vitamin_a_iu: Mapped[float] = mapped_column(DOUBLE_PRECISION)
    vitamin_e: Mapped[float] = mapped_column(DOUBLE_PRECISION)
    vitamin_c: Mapped[float] = mapped_column(DOUBLE_PRECISION)
    vitamin_b6: Mapped[float] = mapped_column(DOUBLE_PRECISION)

    vitamin_b12: Mapped[float] = mapped_column(DOUBLE_PRECISION)
    vitamin_k: Mapped[float] = mapped_column(DOUBLE_PRECISION)

    english_name: Mapped[str] = mapped_column(String(255))

    tarich_ptiha: Mapped[datetime] = mapped_column(DateTime(True))
    midot: Mapped[list["YehidotMidaLemitzrachim"]] = relationship()

    meals_eaten: Mapped["MealsEaten"] = relationship(  # pyright: ignore[reportUndefinedVariable]
        'MealsEaten', back_populates='code')

    @override
    def __repr__(self) -> str:
        return f'<Mitzrahim | code(id): {self.code} sml: {self.smlmitzrach} shmm:{self.shmmitzrach}, codes:{self.midot}>'

# Parent