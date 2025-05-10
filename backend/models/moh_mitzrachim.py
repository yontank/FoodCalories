from sqlalchemy import create_engine, SmallInteger, Column, Integer, String, DateTime, Table, DOUBLE_PRECISION
from sqlalchemy.orm import declarative_base, sessionmaker, relationship
from .based import Base
from .moh_yehidot_mida_lemitzrachim import yehidot_mida_lemitzrachim

class moh_mitzrachim(Base):
    __tablename__ = "moh_mitzrachim"

    code = Column(SmallInteger, primary_key=True)
    smlmitzrach = Column(Integer())
    shmmitzrach = Column(String(255))
    makor = Column(SmallInteger())

    protein = Column(DOUBLE_PRECISION)
    total_fat = Column(DOUBLE_PRECISION)
    carbohydrates = Column(DOUBLE_PRECISION)
    food_energy = Column(SmallInteger)
    alcohol = Column(DOUBLE_PRECISION)

    total_dietary_fiber = Column(DOUBLE_PRECISION)
    calcium = Column(DOUBLE_PRECISION)
    iron = Column(DOUBLE_PRECISION)
    magnesium = Column(DOUBLE_PRECISION)
    sodium = Column(DOUBLE_PRECISION)
    cholesterol = Column(DOUBLE_PRECISION)
    saturated_fat = Column(DOUBLE_PRECISION)
    fructose = Column(DOUBLE_PRECISION)

    vitamin_a_iu = Column(DOUBLE_PRECISION)
    vitamin_e = Column(DOUBLE_PRECISION)
    vitamin_c = Column(DOUBLE_PRECISION)
    vitamin_b6 = Column(DOUBLE_PRECISION)
    
    vitamin_b12 = Column(DOUBLE_PRECISION)
    vitamin_k = Column(DOUBLE_PRECISION)

    english_name = Column(String(255))

    tarich_ptiha = Column(DateTime(True))
    updatedat = Column(DateTime(True))
    midot = relationship(yehidot_mida_lemitzrachim)
    
    meals_eaten = relationship('meals_eaten', back_populates='code')
    
    def __repr__(self):
        return f'\n<Mitzrahim | code(id): {self.code} sml: {self.smlmitzrach} shmm:{self.shmmitzrach}, codes:{self.midot}>\n'
    
    