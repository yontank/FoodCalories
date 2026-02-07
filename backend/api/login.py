from typing import Dict, List
from fastapi import APIRouter, HTTPException, status
from db import session
from sqlalchemy import exists
from models.user import * 
from schemas import *
from pwdlib import PasswordHash
from datetime import timedelta, timezone
import jwt

router = APIRouter()
SECRET_KEY = "8e161dcfe4ebe2d055212edfb12bdfec2a0be9baca7cec5e6e21ca63787b0f8d"
ALGORITHM = "HS 256"

ph = PasswordHash.recommended()

def verify_password(plain_password, hashed_password):
    return ph.verify(plain_password, hashed_password)


def hash_password(password):
    return ph.hash(password)


def authenticate_user(user : User):
    db_user = session.query(User).filter(User.username == user.username).first()
    
    if not user:
        return None
    if not verify_password(user.password, db_user.hashed_password):
        return None
    
    return db_user

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.now(timezone.utc)  + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    
    to_encode.update({"exp" : expire})
    
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    
    return encoded_jwt

@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(user: UserRegister):
    # Convert Pydantic Model into SQLAlchemy Schema
    username_exists = session.query(exists().where(User.username == user.username)).scalar()
    
    if username_exists:
        raise HTTPException(status.HTTP_409_CONFLICT, "username is already taken")

    hashed_password = hash_password(user.password)
    
    session.add(User(username= user.username, hashed_password= hashed_password))
    session.commit()


    
    