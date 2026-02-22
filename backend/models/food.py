"""
Pydantic models for the food data, including the base food model,
query model, and models for food eaten and food eaten today.
Currently integrated with FastAPI
"""

from datetime import datetime
from pydantic import AliasPath, BaseModel, Field, ConfigDict, PositiveInt
from backend.schemas.meals_eaten import MealType


class FoodItem(BaseModel):

    """
    The most basic model for a food item, containing only the essential information.
    Returns A FoodType(MohMitzrach), with:
        - code (Its ID Value)
        - SHMValue (The Food Name)
        - SMLValue (The Foood QR Code?)
        """
    model_config = ConfigDict(from_attributes=True)

    # The ID of the food item in the database
    food_id: int = Field(validation_alias='code')
    # smlmitzrach: int # I dont know what this is, im thinking its the QR bar, will check later.
    food_name: str = Field(validation_alias='shmmitzrach')


class MeasurementUnit(BaseModel):
    """
    The base model for a Yehida (unit of measurement) in the food system.

    - smlmida: the ID of the unit of measurement inside DB
    - shmmida: the name of the unit of measurement inside DB
    """

    model_config = ConfigDict(from_attributes=True)
    id: int = Field(validation_alias='smlmida')
    name: str | None = Field(validation_alias='shmmida')


class PortionSize(BaseModel):
    """
    A model representing the relationship between a food item (MohMitzrach) and its unit of measurement (Yehida).
    This model is used to calculate the calories of a meal by connecting the food item with its
    unit of measurement and the weight of that unit in grams.
    Currently the values are

    id: The id of the current mida from the Yehidot Table.
    name: The current name from the Yehidot table
    mishkal: Given the mishkal and the food item, how many grams does this mida count as?

    """

    id: int = Field(validation_alias=AliasPath("name", "smlmida"))
    name: str = Field(validation_alias=AliasPath("name", "shmmida"))
    mishkal: float


class FoodListItem(FoodItem):
    model_config = ConfigDict(from_attributes=True)
    english_name: str | None = None


class FoodDetail(FoodItem):
    """
    A Pydantic model that shows what information to expect from a query on food from food items

    curently,
    the model receives not only information about basic nutrients of a specific food,
    but also the name of it, the id of the food

    and different ways to "size it up"
    """

    model_config = ConfigDict(from_attributes=True)

    protein: float
    total_fat: float
    carbohydrates: float | None = None
    food_energy: PositiveInt

    midot: list[PortionSize]


class MealEntry(BaseModel):
    """
    An API Model For Returning What the person ate in a specific day.
    code_id: the ID of the food item eaten, which is a foreign key to MohMitzrachim.code.
    mida_id: the ID of the unit of measurement, which is a foreign key to YehidotMida
    amount: the amount of the food eaten, which is used to calculate the calories of the meal.
    meal_type: the type of meal eaten(breakfast, lunch, dinner), which is used to categorize the meals eaten by the user.
    """
    model_config = ConfigDict(from_attributes=True)

    food_id: int = Field()
    mida_id: int = Field()
    amount: float = Field()
    meal_type: MealType = Field()


class MealEntryResponse(BaseModel):
    food_name: str = Field()
    date: datetime

    protein: float
    total_fat: float
    carbohydrates: float | None = None
    food_energy: float

    mida: MeasurementUnit = Field()
    # mida: PortionSize = Field()
    meal_id: int = Field()
    amount: float = Field()
    mishkal: float
    meal_type: MealType
