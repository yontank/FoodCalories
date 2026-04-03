from datetime import datetime
from typing import Annotated

from haikunator import Haikunator
from fastapi import Query, Request, APIRouter, Depends, status
from fastapi.responses import JSONResponse
from sqlalchemy import select
from sqlalchemy.orm import Session
from core.rate_limit import limiter
from db.dependency import get_db
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
    db: Session = Depends(get_db),
) -> None:
    """Adds a weight entry to the user's weight history."""
    db_entry = WeightHistory(user_id=current_user.sub, weight=weight)
    db.add(db_entry)


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
    db: Session = Depends(get_db),
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
    entries = db.execute(stmt).scalars().all()
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
    db: Session = Depends(get_db),
):
    """Returns the user's personal profile."""
    profile = db.execute(
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
    db: Session = Depends(get_db),
):
    """Returns the user's nutrition profile."""
    profile = db.execute(
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
    db: Session = Depends(get_db),
) -> None:
    """Saves or updates the user's daily macro-nutrient targets."""
    profile = db.execute(
        select(NutritionProfile).where(NutritionProfile.user_id == current_user.sub)
    ).scalar_one_or_none()

    if profile is None:
        profile = NutritionProfile(user_id=current_user.sub)
        db.add(profile)

    profile.protein_g = nutrition.protein
    profile.carbohydrates_g = nutrition.carbohydrates
    profile.fat_g = nutrition.fat


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
    db: Session = Depends(get_db),
) -> None:
    """Saves or updates the user's personal profile (age, height, gender, activity factor)."""
    profile_var = db.execute(
        select(UserProfile).where(UserProfile.user_id == current_user.sub)
    ).scalar_one_or_none()

    if not profile_var:
        profile_var = UserProfile(
            user_id=current_user.sub,
            name_display=Haikunator().haikunate(),
        )
        db.add(profile_var)

    profile_var.age = profile.age
    profile_var.gender = profile.gender
    profile_var.height = profile.height
    profile_var.activity_factor = profile.activity_factor
