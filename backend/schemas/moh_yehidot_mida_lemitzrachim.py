from typing import override
from sqlalchemy import SmallInteger, DOUBLE_PRECISION, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .based import Base


class YehidotMidaLemitzrachim(Base):
    """_summary_
    Table Schema for YehoditMidaLemitzrachim, 
    which is a table that connects between the food and the size of the meal,
    to get the calories of the meal.
    This table is used to get the calories of the meal,
    by connecting between the food and the size of the meal,
    to get the calories of the meal.   


    mmitzrach: the id of the food, which is a foreign key to moh_mitzrachim.code.
    mida: the id of the meal size, which is a foreign key to moh_yehidot_mida.smlmida.
    mishkal: the weight of the meal size in grams,
    which is used to calculate the calories of the meal.
    """
    __tablename__: str = 'moh_yehidot_mida_lemitzrachim'

    mmitzrach: Mapped[int] = mapped_column(
        ForeignKey('moh_mitzrachim.code'))
    mida: Mapped[int] = mapped_column(
        SmallInteger, ForeignKey('moh_yehidot_mida.smlmida'))
    mishkal: Mapped[float] = mapped_column(
        DOUBLE_PRECISION(), primary_key=True)
    name: Mapped[str] = relationship('YehidotMida')

    @override
    def __repr__(self):
        return f'<TableJoin(id={self.mmitzrach} mida={self.mida}, mishkal={self.mishkal}, name={self.name})>'
