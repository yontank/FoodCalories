from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from starlette.status import HTTP_201_CREATED, HTTP_406_NOT_ACCEPTABLE

from backend.api.login import get_current_user
from backend.models.tokens import JWTAccessBase
from backend.schemas.meals_eaten import MealsEaten
from backend.schemas.user import User

from ..schemas import MohMitzrachim
from ..models.food import FoodDetail, MealEntry
from ..db import session


router = APIRouter()


@router.get('/foods/{food_query}', response_model_by_alias=False, response_model=dict[str, list[FoodDetail]])
def query_foods(food_query: str, current_user: Annotated[JWTAccessBase, Depends(get_current_user)]):
    if foods := session.query(MohMitzrachim).filter(MohMitzrachim.shmmitzrach.contains(food_query)).limit(20).all():
        return {'data': foods}
    raise HTTPException(404, "food type wasnt found")


@router.put('/meal', response_model_by_alias=False,  status_code=HTTP_201_CREATED)
def add_meal(
    current_user: Annotated[JWTAccessBase, Depends(get_current_user)],
    meal: MealEntry
):
    user_id = session.execute(select(User.id).where(
        User.username == current_user.sub)).scalar_one()
    db_meal: MealsEaten = MealsEaten(user_id=user_id,
                                     code_id=meal.food_id,
                                     mida_id=meal.mida_id,
                                     amount=meal.amount,
                                     meal_type=meal.meal_type,
                                     )

    session.add(db_meal)

    session.commit()


@router.delete('/meal', response_model_by_alias=False,  status_code=HTTP_201_CREATED)
def delete_meal(
    current_user: Annotated[JWTAccessBase, Depends(get_current_user)],
    meal_id: int
):
    # Check That it is indeed the corect user asking to delete.

    #
    stmt = (
        select(MealsEaten).where(MealsEaten.id == meal_id)
    )

    db_meal = session.execute(stmt).scalar_one_or_none()

    if not db_meal:
        raise HTTPException(HTTP_406_NOT_ACCEPTABLE, "Meal item doesn't exist")

    session.delete(db_meal)

    session.commit()

    #

    # @router.put
    # @router.delete
    # @router.patch
