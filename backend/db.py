from sqlalchemy import create_engine, Column,Integer, String, Table, SmallInteger
from sqlalchemy.orm import declarative_base, sessionmaker
from schemas.user import User
from schemas.based import Base
from datetime import datetime

engine = create_engine("postgresql://postgres:postgres@localhost:5432/FoodCaloriesDev")
print(engine)



Session  = sessionmaker(bind = engine)
session = Session()

#User.__table__.create(bind=engine)

def init_db():
    Base.metadata.drop_all(engine)
    Base.metadata.create_all(engine)

