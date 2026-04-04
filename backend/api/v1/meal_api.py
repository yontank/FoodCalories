import csv
import io
from collections.abc import Sequence
from datetime import datetime, timedelta
from typing import Annotated, Optional

from fastapi import APIRouter, Depends, Request, status
from fastapi.responses import JSONResponse, StreamingResponse
from sqlalchemy import delete, select
from core.rate_limit import limiter
from db.session import session
from models.api_error_model import Message
from models.food import (
    FoodDetail,
    MealEntry,
    MealEntryResponse,
    MeasurementUnit,
)
from models.tokens import JWTAccessBase
from db.schemas.meals_eaten import MealsEaten
from db.schemas.moh_mitzrachim import MohMitzrachim

from api.v1.login import get_current_user

router = APIRouter()


@router.get(
    "/foods",
    response_model_by_alias=False,
    response_model=list[FoodDetail],
    responses={401: {"model": Message}},
)
@limiter.limit("10/minute")
def query_foods(
    request: Request,
    food_query: str,
    _: Annotated[JWTAccessBase, Depends(get_current_user)],
):
    """Given A User query that is authenticated, return food that is a substring of that food"""
    # NOTE: Maybe this function is supposed to be a recommendation algorithm? There has to be a better way than this.
    res: list[FoodDetail] = []
    if (
        foods := session.query(MohMitzrachim)
        .filter(MohMitzrachim.shmmitzrach.contains(food_query))
        .limit(20)
        .all()
    ):
        for food in foods:
            res.append(FoodDetail.model_validate(food, from_attributes=True))
    return res


@router.get(
    "/food",
    response_model_by_alias=False,
    response_model=Optional[FoodDetail],
    responses={401: {"model": Message}},
)
@limiter.limit("10/minute")
def query_food_by_id(
    request: Request,
    food_id: int,
    _: Annotated[JWTAccessBase, Depends(get_current_user)],
):
    """Returns the food item with the given ID."""
    if (food := session.query(MohMitzrachim).get(food_id)):
        return FoodDetail.model_validate(food, from_attributes=True)
    return None


@router.put(
    "/meal",
    response_model_by_alias=False,
    status_code=status.HTTP_201_CREATED,
    responses={401: {"model": Message}},
)
@limiter.limit("10/minute")
def add_meal(
    request: Request,
    current_user: Annotated[JWTAccessBase, Depends(get_current_user)],
    meal: MealEntry,
) -> None:
    """Creates a new meal data and sends it into the database"""

    db_meal: MealsEaten = MealsEaten(
        user_id=current_user.sub,
        code_id=meal.food_id,
        mida_id=meal.mida_id,
        amount=meal.amount,
        meal_type=meal.meal_type,
    )

    session.add(db_meal)

    session.commit()


@router.delete(
    "/meal",
    response_model=None,
    response_model_by_alias=False,
    status_code=status.HTTP_201_CREATED,
    responses={403: {"model": Message}, 401: {"model": Message}},
)
def delete_meal(
    request: Request,
    current_user: Annotated[JWTAccessBase, Depends(get_current_user)],
    meal_id: int,
):
    """given a meal id, deletes a user meal"""
    # Check That it is indeed the corect user asking to delete.
    stmt = select(MealsEaten).where(MealsEaten.id == meal_id)

    db_meal = session.execute(stmt).scalar_one_or_none()

    if not db_meal or db_meal.user_id != current_user.sub:
        return JSONResponse(
            status_code=status.HTTP_403_FORBIDDEN, content="Meal item doesn't exist"
        )

    session.delete(db_meal)

    session.commit()


@router.delete(
    "/meals",
    response_model=None,
    status_code=status.HTTP_204_NO_CONTENT,
    responses={401: {"model": Message}},
)
@limiter.limit("10/minute")
def delete_all_meals(
    request: Request,
    current_user: Annotated[JWTAccessBase, Depends(get_current_user)],
):
    """Deletes all meal history for the current user"""
    stmt = delete(MealsEaten).where(MealsEaten.user_id == current_user.sub)
    session.execute(stmt)
    session.commit()


@router.patch(
    "/meal",
    response_model=None,
    response_model_by_alias=False,
    status_code=status.HTTP_200_OK,
    responses={403: {"model": Message}, 401: {"model": Message}},
)
@limiter.limit("10/minute")
def update_meal(
    request: Request,
    current_user: Annotated[JWTAccessBase, Depends(get_current_user)],
    meal: MealEntry,
    meal_id: int,
):
    """Update a meal value from a specific user"""
    # 1. Check that mida_id Meals Eaten value is the correct user_id

    db_meal = session.get(MealsEaten, meal_id)

    if not db_meal or db_meal.user_id != current_user.sub:
        return JSONResponse(
            status_code=status.HTTP_403_FORBIDDEN, content="Meal item doesn't exist"
        )

    db_meal.code_id = meal.food_id
    db_meal.mida_id = meal.mida_id
    db_meal.amount = meal.amount
    db_meal.meal_type = meal.meal_type

    session.commit()


@router.get(
    f"/meals",
    response_model=list[MealEntryResponse],
    response_model_by_alias=False,
    status_code=status.HTTP_200_OK,
    responses={400: {"model": Message}, 401: {"model": Message}},
)
@limiter.limit("10/minute")
def get_meals_by_date_start_end_date(
    request: Request,
    current_user: Annotated[JWTAccessBase, Depends(get_current_user)],
    date: datetime,
    end_date: datetime | None = None,
):
    """
    Returns all the meals the user has consumed in a specific date, or between a range of dates.
    """

    if end_date and end_date < date:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content="End date must be after start date",
        )

    start_of_start_date = date

    if not end_date:
        end_of_end_date = start_of_start_date + timedelta(days=1)
    else:
        end_of_end_date = end_date + timedelta(days=1)

    stmt = select(MealsEaten).where(
        MealsEaten.user_id == current_user.sub,
        MealsEaten.date >= start_of_start_date,
        MealsEaten.date < end_of_end_date,
    )

    meals: Sequence[MealsEaten] = session.execute(stmt).scalars().all()

    res: list[MealEntryResponse] = []

    for meal in meals:
        res.append(
            MealEntryResponse(
                food_id=meal.code.code,
                date=meal.date,
                meal_type=meal.meal_type,
                protein=meal.code.protein,
                total_fat=meal.code.total_fat,
                carbohydrates=meal.code.carbohydrates,
                food_energy=meal.code.food_energy,
                food_name=meal.code.shmmitzrach,
                meal_id=meal.id,
                amount=meal.amount,
                mida=MeasurementUnit(
                    id=meal.mida_id,
                    name=meal.mida.shmmida,
                ),
                mishkal=meal.mishkal.mishkal,
            )
        )

    return res


@router.get(
    "/meals/export",
    status_code=status.HTTP_200_OK,
    responses={401: {"model": Message}},
)
@limiter.limit("10/minute")
def export_meals_csv(
    request: Request,
    current_user: Annotated[JWTAccessBase, Depends(get_current_user)],
):
    """Returns all meal history for the current user as a downloadable CSV file."""
    stmt = select(MealsEaten).where(MealsEaten.user_id == current_user.sub)
    meals: Sequence[MealsEaten] = session.execute(stmt).scalars().all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(
        [
            "date",
            "mealType",
            "foodName",
            "amount",
            "unit",
            "calories",
            "protein",
            "fat",
            "carbohydrates",
        ]
    )

    for meal in meals:
        writer.writerow(
            [
                meal.date.isoformat(),
                meal.meal_type,
                meal.code.shmmitzrach,
                meal.amount,
                meal.mida.shmmida,
                round(
                    meal.code.food_energy * meal.mishkal.mishkal * meal.amount / 100, 2
                ),
                round(meal.code.protein * meal.mishkal.mishkal * meal.amount / 100, 2),
                round(
                    meal.code.total_fat * meal.mishkal.mishkal * meal.amount / 100, 2
                ),
                round(
                    (meal.code.carbohydrates or 0)
                    * meal.mishkal.mishkal
                    * meal.amount
                    / 100,
                    2,
                ),
            ]
        )

    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=meals.csv"},
    )
