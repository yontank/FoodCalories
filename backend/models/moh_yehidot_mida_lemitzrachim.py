from sqlalchemy import Column, SmallInteger, DOUBLE_PRECISION,ForeignKey
from sqlalchemy.orm import relationship
from .based import Base

class yehidot_mida_lemitzrachim(Base):
    __tablename__ = 'moh_yehidot_mida_lemitzrachim'
    
    mmitzrach = Column('mmitzrach' ,SmallInteger(), ForeignKey('moh_mitzrachim.code'))
    mida = Column(SmallInteger, ForeignKey('moh_yehidot_mida.smlmida'))
    mishkal = Column(DOUBLE_PRECISION(), primary_key=True)
    name = relationship('Yehidot_Mida')
    
    def __repr__(self):
        return f'<TableJoin(id={self.mmitzrach} mida={self.mida}, mishkal={self.mishkal}, name={self.name}))'