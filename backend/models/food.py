"""
Pydantic models for the food data, including the base food model,
query model, and models for food eaten and food eaten today.
Currently integrated with FastAPI
"""

from typing import final
from pydantic import BaseModel, Field, ConfigDict, PositiveInt


class FoodBase(BaseModel):

    """
    The most basic model for a food item, containing only the essential information.
    Returns A FoodType(MohMitzrach), with:
        - code (Its ID Value)
        - SHMValue (The Food Name)
        - SMLValue (The Foood QR Code?)
        """
    model_config = ConfigDict(from_attributes=True)

    # The ID of the food item in the database
    food_id: int = Field(alias='code')
    # smlmitzrach: int # I dont know what this is, im thinking its the QR bar, will check later.
    food_name: str = Field(alias='shmmitzrach')


class YehidaBase(BaseModel):
    """
    The base model for a Yehida (unit of measurement) in the food system.

    - smlmida: the ID of the unit of measurement inside DB
    - shmmida: the name of the unit of measurement inside DB
    """

    model_config = ConfigDict(from_attributes=True)
    id: int = Field(alias='smlmida')
    name: str | None = Field(alias='shmmida')


class YehidotMidaMitzrachim(BaseModel):
    """
    A model representing the relationship between a food item (MohMitzrach) and its unit of measurement (Yehida).
    This model is used to calculate the calories of a meal by connecting the food item with its
    unit of measurement and the weight of that unit in grams.
    """
    model_config = ConfigDict(from_attributes=True)
    mida: int
    mishkal: float
    size: YehidaBase = Field(alias='name')

# Depracted, I dont remember using this? ever?


class ListFood(FoodBase):
    model_config = ConfigDict(from_attributes=True)
    english_name: str | None = None


class QueryFood(FoodBase):
    model_config = ConfigDict(from_attributes=True)

    protein: float | None = None
    total_fat: float | None = None
    carbohydrates: float | None = None
    food_energy: PositiveInt | None = None

    midot: list[YehidotMidaMitzrachim]


class FoodEaten(BaseModel):
    """An API Model For Returning What the person ate in a specific day.
    code_id: the ID of the food item eaten, which is a foreign key to MohMitzrachim.code.
    mida_id: the ID of the unit of measurement, which is a foreign key to Yeh
    amount: the amount of the food eaten, which is used to calculate the calories of the meal.
    meal_type: the type of meal eaten (breakfast, lunch, dinner), which is used to categorize the meals eaten by the user.
    """
    code_id: int = Field(alias='codeId')
    mida_id: int = Field(alias='unitType')
    amount: float
    meal_type: int = Field(alias='mealType')
