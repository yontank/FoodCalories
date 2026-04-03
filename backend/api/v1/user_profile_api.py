from datetime import datetime
from typing import Annotated

from haikunator import Haikunator
from fastapi import Query, Request, APIRouter, Depends, status
from fastapi.responses import JSONResponse
from sqlalchemy import select
from core.rate_limit import limiter
from db.session import session
from db.schemas.weight_history import WeightHistory
from db.schemas.user_profile import UserProfile
from db.schemas.user_nutrition_profile import NutritionProfile
from models.api_error_model import Message
from models.food import NutritionValues, ProfileValues, WeightEntry
from models.tokens import JWTAccessBase

from api.v1.login import get_current_user


router = APIRouter(tags=["User Profile"])


## Function to add a users weight to history
@router.put(
    "/weight",
    response_model=None,
    status_code=status.HTTP_201_CREATED,
    responses={401: {"model": Message}},
)
@limiter.limit("10/minute")
def add_weight_entry(
    request: Request,
    current_user: Annotated[JWTAccessBase, Depends(get_current_user)],
    weight: float = Query(gt=0),
) -> None:
    """Adds a weight entry to the user's weight history."""
    db_entry = WeightHistory(user_id=current_user.sub, weight=weight)
    session.add(db_entry)
    session.commit()


@router.get(
    "/weight",
    response_model=list[WeightEntry],
    status_code=status.HTTP_200_OK,
    responses={401: {"model": Message}},
)
@limiter.limit("10/minute")
def get_weight_history(
    request: Request,
    current_user: Annotated[JWTAccessBase, Depends(get_current_user)],
    start_date: datetime = Query(),
    end_date: datetime = Query(),
) -> list[WeightEntry]:
    """Returns weight entries for the current user between start_date and end_date."""
    stmt = (
        select(WeightHistory)
        .where(
            WeightHistory.user_id == current_user.sub,
            WeightHistory.created_at >= start_date,
            WeightHistory.created_at <= end_date,
        )
        .order_by(WeightHistory.created_at)
    )
    entries = session.execute(stmt).scalars().all()
    return [WeightEntry.model_validate(e) for e in entries]


@router.get(
    "/profile",
    response_model=ProfileValues,
    status_code=status.HTTP_200_OK,
    responses={401: {"model": Message}, 404: {"model": Message}},
)
@limiter.limit("10/minute")
def get_personal_profile(
    request: Request,
    current_user: Annotated[JWTAccessBase, Depends(get_current_user)],
):
    """Returns the user's personal profile."""
    profile = session.execute(
        select(UserProfile).where(UserProfile.user_id == current_user.sub)
    ).scalar_one_or_none()

    if profile is None:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={"message": "Profile not found"},
        )

    return ProfileValues(
        height=profile.height,
        age=profile.age,
        activity_factor=profile.activity_factor,
        gender=profile.gender,
    )


@router.get(
    "/profile/nutrition",
    response_model=NutritionValues,
    status_code=status.HTTP_200_OK,
    responses={401: {"model": Message}, 404: {"model": Message}},
)
@limiter.limit("10/minute")
def get_nutrition_profile(
    request: Request,
    current_user: Annotated[JWTAccessBase, Depends(get_current_user)],
):
    """Returns the user's nutrition profile."""
    profile = session.execute(
        select(NutritionProfile).where(NutritionProfile.user_id == current_user.sub)
    ).scalar_one_or_none()

    if profile is None:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={"message": "Nutrition profile not found"},
        )

    return NutritionValues(
        protein=profile.protein_g,
        carbohydrates=profile.carbohydrates_g,
        fat=profile.fat_g,
    )


## Function to save the users nutrient values
# Protein, Carbs, Fats, etc.
## FIXME: Go over this function! Make sure its correct!


@router.patch(
    "/profile/nutrition",
    response_model=None,
    status_code=status.HTTP_201_CREATED,
    responses={401: {"model": Message}},
)
@limiter.limit("10/minute")
def save_nutrition_values(
    request: Request,
    current_user: Annotated[JWTAccessBase, Depends(get_current_user)],
    nutrition: NutritionValues,
) -> None:
    """Saves or updates the user's daily macro-nutrient targets."""
    profile = session.execute(
        select(NutritionProfile).where(NutritionProfile.user_id == current_user.sub)
    ).scalar_one_or_none()

    if profile is None:
        profile = NutritionProfile(user_id=current_user.sub)
        session.add(profile)

    profile.protein_g = nutrition.protein
    profile.carbohydrates_g = nutrition.carbohydrates
    profile.fat_g = nutrition.fat

    session.commit()


## Function to save User Personal Profile
## Age, Height, Activity Factor, Gender.
## NOTE: After Finishing, you should sync with the fe.
## FIXME: Go over this function! Make sure its correct!
@router.patch(
    "/profile",
    response_model=None,
    status_code=status.HTTP_201_CREATED,
    responses={401: {"model": Message}},
)
@limiter.limit("10/minute")
def save_personal_profile(
    request: Request,
    current_user: Annotated[JWTAccessBase, Depends(get_current_user)],
    profile: ProfileValues,
) -> None:
    """Saves or updates the user's personal profile (age, height, gender, activity factor)."""
    profile_var = session.execute(
        select(UserProfile).where(UserProfile.user_id == current_user.sub)
    ).scalar_one_or_none()

    if not profile_var:
        profile_var = UserProfile(
            user_id=current_user.sub,
            name_display=Haikunator().haikunate(),
        )
        session.add(profile_var)

    profile_var.age = profile.age
    profile_var.gender = profile.gender
    profile_var.height = profile.height
    profile_var.activity_factor = profile.activity_factor

    session.commit()
