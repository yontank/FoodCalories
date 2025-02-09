from sqlalchemy import Column, SmallInteger, DOUBLE_PRECISION
from .based import Base

class yehidot_mida_lemitzrachim(Base):
    __tablename__ = 'moh_yehidot_mida'
    
    mmitzrach = Column(SmallInteger())
    mida = Column(SmallInteger())
    mishkal = Column(DOUBLE_PRECISION(), primary_key=True)