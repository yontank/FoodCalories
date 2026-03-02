import os

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

database_url = os.getenv("DATABASE_URL")

if not database_url:
    raise Exception("Env doesn't contain Docker path for container DB")
engine = create_engine(database_url)


Session = sessionmaker(bind=engine)
session = Session()
