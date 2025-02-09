from sqlalchemy import create_engine, Column,Integer, String, Table, SmallInteger
from sqlalchemy.orm import declarative_base, sessionmaker

engine = create_engine("postgresql://postgres:postgres@localhost:5432/FoodCaloriesDev")
print(engine)

Base = declarative_base();
print("logon succesfully.")

Session  = sessionmaker(bind = engine)
session = Session()

def init_db():
    Base.metadata.drop_all(engine)
    Base.metadata.create_all(engine)

if __name__ == '__main__':
    init_db()