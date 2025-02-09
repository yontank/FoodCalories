from datetime import datetime
from sqlalchemy import Column, String,SmallInteger, Integer, ForeignKey, Enum, DateTime, Boolean
from sqlalchemy.orm import relationship
from .based import Base


class Yehidot_Mida(Base):
    __tablename__ = "moh_yehidot_mida"
    __table_args__ = {'extend_existing': True}
    
    smlmida = Column(SmallInteger, primary_key=True, nullable=False)
    shmmida = Column(String(30))
    
    
    
    
    
    def __repr__(self):
        return f'<Yehidot_Mida | smlmida(id): {self.smlmida} shmmida: {self.shmmida}>'
    
