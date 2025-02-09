from sqlalchemy import create_engine, SmallInteger, Column, Integer, String, DateTime, Table, DOUBLE_PRECISION
from sqlalchemy.orm import declarative_base, sessionmaker
from .based import Base

class moh_mitzrachim(Base):
    __tablename__ = "moh_mitzrachim"

    code = Column(SmallInteger, primary_key=True)
    smlmitzrach = Column(Integer())
    shmmitzrach = Column(String(255))
    makor = Column(SmallInteger())

    protein = Column(DOUBLE_PRECISION)
    total_fat = Column(DOUBLE_PRECISION)
    carbohydrates = Column(DOUBLE_PRECISION)
    food_energy = SmallInteger
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
    updatedAt = Column(DateTime(True))
