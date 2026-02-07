from typing import Optional, List, Annotated
from pydantic import BaseModel, Field, ConfigDict, constr, AfterValidator
from pydantic import (PositiveInt)
from datetime import datetime

def is_good_password(password: str):
    digits, special = 0, 0
    
    for c in password:
        if c.isdigit():
            digits += 1
        elif not c.isalnum():
            special += 1
    
    if not digits :
        raise ValueError("password doesn't have numbers")
    elif not special:
        raise ValueError("password doesn't have special characters")
    
    elif len(password) < 8:
        raise ValueError("password must be atleast 8 characters long")
    
    return password      
            

class UserRegister(BaseModel):
    username : str =  Field(min_length=2 ,max_length=16)
    password: Annotated[str, AfterValidator(is_good_password)]
    
    