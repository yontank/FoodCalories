from typing import Annotated

from fastapi import Query, Request, APIRouter, Depends, status
from sqlalchemy import select
from core.rate_limit import limiter
from db.session import session
from db.schemas.weight_history import WeightHistory
from db.schemas.user_profile import UserProfile
from db.schemas.user_nutrition_profile import NutritionProfile
from models.api_error_model import Message
from models.food import NutritionValues, ProfileValues
from models.tokens import JWTAccessBase

from api.v1.login import get_current_user


router = APIRouter()


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
        profile_var = UserProfile(user_id=current_user.sub)
        session.add(profile_var)

    profile_var.age = profile.age
    profile_var.gender = profile.gender
    profile_var.height = profile.height
    profile_var.activity_factor = profile.activity_factor

    session.commit()
