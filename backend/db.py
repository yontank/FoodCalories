from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker


engine = create_engine(
    "postgresql://postgres:postgres@localhost:5432/foodcaloriesdev")


Session = sessionmaker(bind=engine)
session = Session()
