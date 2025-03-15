from sqlalchemy import create_engine, Column,Integer, String, Table, SmallInteger
from sqlalchemy.orm import declarative_base, sessionmaker
from models import *
from datetime import datetime

engine = create_engine("postgresql://postgres:postgres@localhost:5432/FoodCaloriesDev")
print(engine)



Session  = sessionmaker(bind = engine)
session = Session()

print(session.query(meals_eaten).first())

def init_db():
    Base.metadata.drop_all(engine)
    Base.metadata.create_all(engine)

