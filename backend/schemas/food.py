from typing import Optional, List, Any

from pydantic import BaseModel, Field, ConfigDict
from pydantic import (PositiveInt)
from datetime import datetime


class YehidaBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    smlmida: int
    shmmida: Optional[str]


class YehidotMidaMitzrachim(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    mida: int
    mishkal: float
    name: YehidaBase


class FoodBase(BaseModel):
    code: int
    smlmitzrach: int
    shmmitzrach: str
    midot: Optional[List[YehidotMidaMitzrachim]]


class ListFood(FoodBase):
    model_config = ConfigDict(from_attributes=True)
    english_name: Optional[str] = None


class QueryFood(FoodBase):
    model_config = ConfigDict(from_attributes=True)

    protein: Optional[float] = None
    total_fat: Optional[float] = None
    carbohydrates: Optional[float] = None
    food_energy: Optional[PositiveInt]

    midot: List[YehidotMidaMitzrachim]


class FoodEaten(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    code_id: int = Field(alias='codeId')
    mida_id: int = Field(alias='unitType')
    amount: float
    meal_type: int = Field(alias='mealType')


class FoodEatenResposne(BaseModel):
    amount: float
    meal_type: int
    mida: YehidaBase
    date: datetime
    code: QueryFood
    mishkal: YehidotMidaMitzrachim
