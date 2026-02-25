# Pydantic models for CSV Validation, to make sure that what we're entering inside the database, is valid.
from pydantic import BaseModel, Field


class MohMitzrachim(BaseModel):

    code: int = Field(validation_alias='Code')
    smlmitzrach: int = Field()
    shmmitzrach: str = Field()
    makor: int | None = Field()

    protein: float = Field()
    total_fat: float = Field()
    carbohydrates: float | None = Field()
    food_energy: float = Field()
    alcohol: float | None = Field()

    total_dietary_fiber: float | None = Field()
    calcium: float | None = Field()
    magnesium: float | None = Field()
    sodium: float | None = Field()
    cholesterol: float | None = Field()
    saturated_fat: float | None = Field()
    fructose: float | None = Field()

    vitamin_a_iu: float | None = Field()
    vitamin_e: float | None = Field()
    vitamin_c: float | None = Field()
    vitamin_b6: float | None = Field()

    vitamin_b12: float | None = Field()
    vitamin_k: float | None = Field()


class MohYehidotMida(BaseModel):
    shmmida: str = Field(min_length=1)
    smlmida: int = Field()


class MohYehidotMidaLemitzrachim(BaseModel):
    mmitzrach: int = Field()
    mida: int = Field()
    mishkal: float = Field()
