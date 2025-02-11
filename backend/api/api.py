from typing import Dict, List
from fastapi import APIRouter, HTTPException
from db import session
from models import *
from schemas import *
from sqlalchemy import func, orm

router = APIRouter()


@router.get('/foods',response_model=Dict[str, List[ListFood]])
def list_food():
    
    if foods := session.query(moh_mitzrachim).limit(20).all():
        
        try:  
            return {'data': map(lambda food: ListFood.model_validate(food) , foods)}
        
        except Exception as e:
            print(e.errors())
            

@router.get('/foods/{food_query}')
def query_foods(food_query : str):
    if foods := session.query(moh_mitzrachim).filter(moh_mitzrachim.shmmitzrach.contains(food_query)).limit(5).all():
        return {'data': foods}
    return HTTPException(404, "food type wasnt found")