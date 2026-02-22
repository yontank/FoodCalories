from fastapi.responses import JSONResponse
from backend.schemas.moh_mitzrachim import MohMitzrachim


from datetime import datetime, timedelta
from typing import Annotated
from collections.abc import Sequence
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from fastapi import status


from backend.api.login import get_current_user
from backend.models.api import Message
from backend.models.tokens import JWTAccessBase
from backend.schemas.meals_eaten import MealsEaten

from ..models.food import FoodDetail, MealEntry, MealEntryResponse, MeasurementUnit, PortionSize
from ..db import session


router = APIRouter()


@router.get('/foods', response_model_by_alias=False, response_model=list[FoodDetail], responses={404: {"model": Message}, 401: {"model": Message}})
def query_foods(food_query: str, _: Annotated[JWTAccessBase, Depends(get_current_user)]):
    res: list[FoodDetail] = []
    if foods := session.query(MohMitzrachim).filter(MohMitzrachim.shmmitzrach.contains(food_query)).limit(20).all():
        for food in foods:
            res.append(FoodDetail.model_validate(food, from_attributes=True))
        return res
    return JSONResponse(status_code=404, content="food type wasnt found")


@router.put('/meal', response_model_by_alias=False,  status_code=status.HTTP_201_CREATED, responses={401: {"model": Message}})
def add_meal(
    current_user: Annotated[JWTAccessBase, Depends(get_current_user)],
    meal: MealEntry
) -> None:
    """Creates a new meal data and sends it into the database"""

    db_meal: MealsEaten = MealsEaten(user_id=current_user.sub,
                                     code_id=meal.food_id,
                                     mida_id=meal.mida_id,
                                     amount=meal.amount,
                                     meal_type=meal.meal_type,
                                     )

    session.add(db_meal)

    session.commit()


@router.delete('/meal', response_model=None, response_model_by_alias=False,  status_code=status.HTTP_201_CREATED, responses={403: {"model": Message}, 401: {"model": Message}})
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
        return JSONResponse(status_code=status.HTTP_403_FORBIDDEN,
                            content="Meal item doesn't exist")

    session.delete(db_meal)

    session.commit()


@router.patch('/meal', response_model=None, response_model_by_alias=False,  status_code=status.HTTP_200_OK, responses={403: {"model": Message}, 401: {"model": Message}})
def update_meal(
    current_user: Annotated[JWTAccessBase, Depends(get_current_user)],
    meal: MealEntry,
    meal_id: int
):
    """Update a meal value from a specific user"""
    # 1. Check that mida_id Meals Eaten value is the correct user_id

    db_meal = session.get(MealsEaten, meal_id)

    if not db_meal or db_meal.user_id != current_user.sub:
        return JSONResponse(status_code=status.HTTP_403_FORBIDDEN,
                            content="Meal item doesn't exist")

    update_data = meal.model_dump(exclude_unset=True)

    for k, v in update_data.items():
        setattr(db_meal, k, v)

    session.commit()


@router.get(f'/meals', response_model=list[MealEntryResponse], response_model_by_alias=False,  status_code=status.HTTP_200_OK, responses={400: {"model": Message}, 401: {"model": Message}})
def get_meals_by_date_start_end_date(
        current_user: Annotated[JWTAccessBase, Depends(get_current_user)],
        date: datetime,
        end_date: datetime | None = None):
    """
    Returns all the meals the user has consumed in a specific date, or between a range of dates.
    """

    if end_date and end_date < date:
        return JSONResponse(status_code=status.HTTP_400_BAD_REQUEST,
                            content="End date must be after start date")

    start_of_start_date = date.replace(
        minute=0, second=0, microsecond=0, hour=0)

    if not end_date:
        end_of_end_date = start_of_start_date + timedelta(days=1)
    else:
        end_of_end_date = end_date.replace(
            minute=0, second=0, microsecond=0, hour=0) + timedelta(days=1)

    stmt = (
        select(MealsEaten).where(MealsEaten.user_id == current_user.sub,
                                 MealsEaten.date >= start_of_start_date,
                                 MealsEaten.date < end_of_end_date)
    )

    meals: Sequence[MealsEaten] = session.execute(stmt).scalars().all()

    res: list[MealEntryResponse] = []

    for meal in meals:
        res.append(MealEntryResponse(
            date=meal.date,
            meal_type = meal.meal_type,
            protein=meal.code.protein,
            total_fat=meal.code.total_fat,
            carbohydrates=meal.code.carbohydrates,
            food_energy=meal.code.food_energy,
            food_name=meal.code.shmmitzrach,
            meal_id=meal.id,
            amount=meal.amount,
            mida=MeasurementUnit(smlmida=meal.mida_id,
                                 shmmida=meal.mida.shmmida,
                                 ),
            mishkal=meal.mishkal.mishkal
        )
        )

    return res
