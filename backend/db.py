from sqlalchemy import create_engine, Column, Integer, String, Table, SmallInteger, cast, Date
from sqlalchemy.orm import declarative_base, sessionmaker

from models import *
import json
from datetime import date

engine = create_engine(
    "postgresql://postgres:postgres@127.0.0.1:5432/FoodCaloriesDev")
print(engine)


Session = sessionmaker(bind=engine)
session = Session()

instance = session.query(meals_eaten, yehidot_mida_lemitzrachim).filter(
    cast(meals_eaten.date, Date) == date.today()).join(yehidot_mida_lemitzrachim, (yehidot_mida_lemitzrachim.mida == meals_eaten.mida_id and yehidot_mida_lemitzrachim.mmitzrach == meals_eaten.code_id)).first()


print(instance)


def init_db():
    Base.metadata.drop_all(engine)
    Base.metadata.create_all(engine)
