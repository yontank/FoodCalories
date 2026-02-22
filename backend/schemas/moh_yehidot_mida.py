from typing import override
from sqlalchemy import String, SmallInteger
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .based import Base
# from .meals_eaten import MealsEaten


class YehidotMida(Base):
    """
    A Scema which contains many different meal sizes, and its id.
    where smlmida is the id of the meal size, and shmmida is the name of the meal size.
    This table is used to get the calories of the meal,
    by connecting between the food and the size of the meal
    """
    __tablename__: str = "moh_yehidot_mida"
    __table_args__: dict[str, bool] = {'extend_existing': True}

    smlmida: Mapped[int] = mapped_column(
        SmallInteger, primary_key=True, nullable=False)
    shmmida: Mapped[str] = mapped_column(String(30))

    meals: Mapped[list['MealsEaten']] = relationship(back_populates='mida')  # pyright: ignore[reportUndefinedVariable]

    @override
    def __repr__(self) -> str:
        return f'<Yehidot_Mida | smlmida(id): {self.smlmida} shmmida: {self.shmmida}>'


# Parent