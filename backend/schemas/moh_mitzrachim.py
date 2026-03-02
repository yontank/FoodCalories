"""Schema table for the food information in the database and application"""

from datetime import datetime
from typing import override

from sqlalchemy import DOUBLE_PRECISION, DateTime, Integer, SmallInteger, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

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
    makor: Mapped[int | None] = mapped_column(SmallInteger(), nullable=True)

    protein: Mapped[float] = mapped_column(DOUBLE_PRECISION)
    total_fat: Mapped[float] = mapped_column(DOUBLE_PRECISION)
    carbohydrates: Mapped[float | None] = mapped_column(DOUBLE_PRECISION, nullable=True)
    food_energy: Mapped[float] = mapped_column(SmallInteger)
    alcohol: Mapped[float | None] = mapped_column(DOUBLE_PRECISION)

    total_dietary_fiber: Mapped[float | None] = mapped_column(
        DOUBLE_PRECISION, nullable=True
    )
    calcium: Mapped[float | None] = mapped_column(DOUBLE_PRECISION, nullable=True)
    iron: Mapped[float | None] = mapped_column(DOUBLE_PRECISION, nullable=True)
    magnesium: Mapped[float | None] = mapped_column(DOUBLE_PRECISION, nullable=True)
    sodium: Mapped[float | None] = mapped_column(DOUBLE_PRECISION, nullable=True)
    cholesterol: Mapped[float | None] = mapped_column(DOUBLE_PRECISION, nullable=True)
    saturated_fat: Mapped[float | None] = mapped_column(DOUBLE_PRECISION, nullable=True)
    fructose: Mapped[float | None] = mapped_column(DOUBLE_PRECISION, nullable=True)

    vitamin_a_iu: Mapped[float | None] = mapped_column(DOUBLE_PRECISION, nullable=True)
    vitamin_e: Mapped[float | None] = mapped_column(DOUBLE_PRECISION, nullable=True)
    vitamin_c: Mapped[float | None] = mapped_column(DOUBLE_PRECISION, nullable=True)
    vitamin_b6: Mapped[float | None] = mapped_column(DOUBLE_PRECISION, nullable=True)

    vitamin_b12: Mapped[float | None] = mapped_column(DOUBLE_PRECISION, nullable=True)
    vitamin_k: Mapped[float | None] = mapped_column(DOUBLE_PRECISION, nullable=True)

    english_name: Mapped[str | None] = mapped_column(String(255), nullable=True)

    tarich_ptiha: Mapped[datetime | None] = mapped_column(DateTime(True), nullable=True)
    midot: Mapped[list["YehidotMidaLemitzrachim"]] = relationship()

    meals_eaten: Mapped["MealsEaten"] = (  # pyright: ignore[reportUndefinedVariable]
        relationship(
            "MealsEaten",
            back_populates="code",
            overlaps="meal_mishkal",
        )
    )

    @override
    def __repr__(self) -> str:
        return f"<Mitzrahim | code(id): {self.code} sml: {self.smlmitzrach} shmm:{self.shmmitzrach}, codes:{self.midot}>"

