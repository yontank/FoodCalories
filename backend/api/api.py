from fastapi import APIRouter, HTTPException

from backend.schemas.moh_yehidot_mida import YehidotMida

from ..schemas import MohMitzrachim
from ..models.food import QueryFood, YehidaBase
from ..db import session


router = APIRouter()


# @router.get('/foods', response_model=Dict[str, List[ListFood]])
# def list_food():
#     if foods := session.query(MohMitzrachim).limit(20).all():
#         return {'data': map(lambda food: ListFood.model_validate(food), foods)}

#     raise HTTPException(403, 'Forbidden')


@router.get('/foods/{food_query}', response_model_by_alias=False, response_model=dict[str, list[QueryFood]])
def query_foods(food_query: str):
    if foods := session.query(MohMitzrachim).filter(MohMitzrachim.shmmitzrach.contains(food_query)).limit(20).all():
        return {'data': foods}
    raise HTTPException(404, "food type wasnt found")


@router.get('/sizes',  response_model_by_alias=False, response_model=list[YehidaBase])
def get_sizes():
    results: list[YehidaBase] = []
    if sizes := session.query(YehidotMida).limit(20).all():
        return sizes

    raise HTTPException(404, "sizes not found")


# @router.get('/todayMeals')
# def today_meals(depends -> currentUser):
#     todays_datetime = datetime(datetime.today().year, datetime.today().month, datetime.today().day)
#     get_eaten_today = session.query(meals_eaten).filter(meals_eaten.date >= todays_datetime).all()

#     return get_eaten_today


# @router.get('/foodInfo/{food_query}', response_model=Dict[str, QueryFood])
# def query_food(food_query: str):
#     if food := session.query(moh_mitzrachim).filter(moh_mitzrachim.code.__eq__(food_query)).first():
#         return {'data': food}
#     raise HTTPException(404, detail='item not found')


# @router.post('/foodEaten')
# async def add_meal_to_day(meal: FoodEaten):
#     updatedMeal = meals_eaten( code_id = meal.code_id,
#                               mida_id = meal.mida_id,
#                               amount = meal.amount,
#                               meal_type = meal_type(meal.meal_type)
#                               )
#     session.add(updatedMeal)
#     session.commit()
