import enum
from .based import Base
from sqlalchemy import Column ,SmallInteger, DOUBLE_PRECISION, Enum, ForeignKey
from .moh_mitzrachim import moh_mitzrachim
from .moh_yehidot_mida import Yehidot_Mida
class meal_type(enum.Enum):
    BREAKFAST = 0
    LUNCH= 1
    DINNER = 2


class meals_eaten(Base):
    __tablename__ = 'meals_eaten'
    
    id = Column(SmallInteger, primary_key=True)
    
    code_id = Column(SmallInteger, ForeignKey(moh_mitzrachim.code))
    mida_id = Column(SmallInteger, ForeignKey(Yehidot_Mida.smlmida))
    
    amount = Column(DOUBLE_PRECISION)
    meal_type = Column(Enum(meal_type))
