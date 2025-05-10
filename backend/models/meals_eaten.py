import enum
from .based import Base
from sqlalchemy import Column, SmallInteger, DOUBLE_PRECISION, Enum, ForeignKey, TIMESTAMP
from .moh_mitzrachim import moh_mitzrachim
from .moh_yehidot_mida import Yehidot_Mida
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship


class meal_type(enum.Enum):
    BREAKFAST = 0
    LUNCH = 1
    DINNER = 2


class meals_eaten(Base):
    __tablename__ = 'meals_eaten'

    id = Column(SmallInteger, primary_key=True)

    code_id = Column(SmallInteger, ForeignKey(moh_mitzrachim.code))
    mida_id = Column(SmallInteger, ForeignKey(Yehidot_Mida.smlmida))

    amount = Column(DOUBLE_PRECISION)
    meal_type = Column(Enum(meal_type))

    date = Column(TIMESTAMP(timezone=True), default=func.now())

    code = relationship('moh_mitzrachim',back_populates='meals_eaten')
    mida = relationship('Yehidot_Mida', back_populates='mida')
    

    def __repr__(self):
        return f'\n<EATEN |meal_type:{self.meal_type},mida:{self.mida} amount:{self.amount} date:{self.date} code:{self.code}>\n'
