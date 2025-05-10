from typing import Dict, List, Tuple
from fastapi import APIRouter, HTTPException
from db import session
from models import *
from schemas import *
from sqlalchemy import func, Date, cast
from datetime import date


router = APIRouter()


@router.get('/foods', response_model=Dict[str, List[ListFood]])
def list_food():
    if foods := session.query(moh_mitzrachim).limit(20).all():
        return {'data': map(lambda food: ListFood.model_validate(food), foods)}

    raise HTTPException(403, 'Forbidden')


@router.get('/foods/{food_query}', response_model=Dict[str, List[QueryFood]])
def query_foods(food_query: str):
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
    updatedMeal = meals_eaten(code_id=meal.code_id,
                              mida_id=meal.mida_id,
                              amount=meal.amount,
                              meal_type=meal_type(meal.meal_type)
                              )
    session.add(updatedMeal)
    session.commit()


@router.get('/todayMeals', response_model=Dict[str, List[FoodEatenResposne]])
def today_meals():

    instances = session.query(meals_eaten).filter(
        cast(meals_eaten.date, Date) == date.today()).all()

    for instance in instances:
        mishkal = session.query(yehidot_mida_lemitzrachim).filter(
            instance.mida_id == yehidot_mida_lemitzrachim.mida,  instance.code_id == yehidot_mida_lemitzrachim.mmitzrach).first()
        instance.__setattr__('mishkal', mishkal)

    return {"data": instances}
