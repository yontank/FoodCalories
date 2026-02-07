
from .based import Base
from sqlalchemy import Column, Integer, String
class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    username = Column(String(50), nullable=False, unique=True)
    hashed_password =Column(String(255), nullable=False) 
    

