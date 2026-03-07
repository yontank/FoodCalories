from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from core.config import settings

engine = create_engine(str(settings.DATABASE_URL))


Session = sessionmaker(bind=engine)
session = Session()
