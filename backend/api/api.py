from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, update
from fastapi import status


from backend.api.login import get_current_user
from backend.models.tokens import JWTAccessBase
from backend.schemas.meals_eaten import MealsEaten

from ..schemas import MohMitzrachim
from ..models.food import FoodDetail, MealEntry
from ..db import session


router = APIRouter()

# FIXME: Don't use / , use a query param.
# example. q={QUERY}


@router.get('/foods/{food_query}', response_model_by_alias=False, response_model=dict[str, list[FoodDetail]])
def query_foods(food_query: str, current_user: Annotated[JWTAccessBase, Depends(get_current_user)]):
    if foods := session.query(MohMitzrachim).filter(MohMitzrachim.shmmitzrach.contains(food_query)).limit(20).all():
        return {'data': foods}
    raise HTTPException(404, "food type wasnt found")


@router.put('/meal', response_model_by_alias=False,  status_code=status.HTTP_201_CREATED)
def add_meal(
    current_user: Annotated[JWTAccessBase, Depends(get_current_user)],
    meal: MealEntry
):
    """Creates a new meal data and sends it into the database"""

    db_meal: MealsEaten = MealsEaten(user_id=current_user.sub,
                                     code_id=meal.food_id,
                                     mida_id=meal.mida_id,
                                     amount=meal.amount,
                                     meal_type=meal.meal_type,
                                     )

    session.add(db_meal)

    session.commit()


@router.delete('/meal', response_model_by_alias=False,  status_code=status.HTTP_201_CREATED)
def delete_meal(
    current_user: Annotated[JWTAccessBase, Depends(get_current_user)],
    meal_id: int
):
    """given a meal id, deletes a user meal"""
    # Check That it is indeed the corect user asking to delete.
    stmt = (
        select(MealsEaten).where(MealsEaten.id == meal_id)
    )

    db_meal = session.execute(stmt).scalar_one_or_none()

    if not db_meal or db_meal.user_id != current_user.sub:
        raise HTTPException(status.HTTP_403_FORBIDDEN,
                            "Meal item doesn't exist")

    session.delete(db_meal)

    session.commit()


@router.patch('/meal', response_model_by_alias=False,  status_code=status.HTTP_200_OK)
def update_meal(
    current_user: Annotated[JWTAccessBase, Depends(get_current_user)],
    meal: MealEntry,
    meal_id: int
):
    """Update a meal value from a specific user"""
    # 1. Check that mida_id Meals Eaten value is the correct user_id

    db_meal = session.get(MealsEaten, meal_id)

    if not db_meal or db_meal.user_id != current_user.sub:
        raise HTTPException(status.HTTP_403_FORBIDDEN,
                            "Meal item doesn't exist")

    update_data = meal.model_dump(exclude_unset=True)

    for k, v in update_data.items():
        setattr(db_meal, k, v)

    session.commit()
