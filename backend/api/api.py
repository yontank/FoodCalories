from typing import Dict, List
from fastapi import APIRouter, HTTPException
from db import session
from models import *
from schemas import *



router = APIRouter()


@router.get('/foods',response_model=Dict[str, List[ListFood]])
def list_food():
    if foods := session.query(moh_mitzrachim).limit(20).all():
        return {'data': map(lambda food: ListFood.model_validate(food) , foods)}

    raise HTTPException(403, 'Forbidden')
            

@router.get('/foods/{food_query}', response_model=Dict[str, List[QueryFood]])
def query_foods(food_query : str):
    if foods := session.query(moh_mitzrachim).filter(moh_mitzrachim.shmmitzrach.contains(food_query)).limit(5).all():
        return {'data': foods}
    raise HTTPException(404, "food type wasnt found")


@router.get('/foodInfo/{food_query}', response_model=Dict[str, QueryFood])
def query_food(food_query: str):
    if food := session.query(moh_mitzrachim).filter(moh_mitzrachim.code.__eq__(food_query)).first():
        return {'data': food}
    raise HTTPException(404, detail='item not found')






@router.post('/foodEaten')
async def add_meal_to_day(meal: FoodEaten):
    updatedMeal = meals_eaten( code_id = meal.code_id,
                              mida_id = meal.mida_id,
                              amount = meal.amount,
                              meal_type = meal_type(meal.meal_type)
                              )
    session.add(updatedMeal)
    session.commit()
    

    