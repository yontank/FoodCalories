from sqlalchemy import create_engine, SmallInteger, Column, Integer, String, DateTime, Table, DOUBLE_PRECISION
from sqlalchemy.orm import declarative_base, sessionmaker
from main import Base


class moh_mitzrachim(Base):
    __tablename__ = "moh_mitzrachim"

    code = SmallInteger()
    smlmitzrach = Integer()
    shmmitzrach = String(255)
    makor = SmallInteger()

    protein = DOUBLE_PRECISION
    total_fat = DOUBLE_PRECISION
    carbohydrates = DOUBLE_PRECISION
    food_energy = SmallInteger
    alcohol = DOUBLE_PRECISION

    total_dietary_fiber = DOUBLE_PRECISION
    calcium = DOUBLE_PRECISION
    iron = DOUBLE_PRECISION
    magnesium = DOUBLE_PRECISION
    sodium = DOUBLE_PRECISION
    cholesterol = DOUBLE_PRECISION
    saturated_fat = DOUBLE_PRECISION
    fructose = DOUBLE_PRECISION

    vitamin_a_iu = DOUBLE_PRECISION
    vitamin_e = DOUBLE_PRECISION
    vitamin_c = DOUBLE_PRECISION
    vitamin_b6 = DOUBLE_PRECISION
    
    vitamin_b12 = DOUBLE_PRECISION
    vitamin_k = DOUBLE_PRECISION

    english_name = String(255)

    tarich_ptiha = DateTime(True)
    updatedAt = DateTime(True)
