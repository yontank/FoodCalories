from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict
from pydantic import (PositiveInt)


class FoodBase(BaseModel):
    code: int
    smlmitzrach: int
    shmmitzrach: str
    
class YehidaBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    smlmida: int
    shmmida: Optional[str]
    
    
    
class YehidotMidaMitzrachim(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    mida: int
    mishkal: int
    name: YehidaBase



class ListFood(FoodBase):
    model_config = ConfigDict(from_attributes=True)
    english_name: Optional[str] = None


class QueryFood(FoodBase):
    model_config = ConfigDict(from_attributes=True)
    
    protein: Optional[float] = None
    total_fat: Optional[float] = None
    carbohydrates: Optional[float] = None
    food_energy :Optional[PositiveInt]
    
    midot: List[YehidotMidaMitzrachim]
    
    
    
