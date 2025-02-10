from typing import Optional
from pydantic import BaseModel, Field, ConfigDict



class FoodBase(BaseModel):
    code: int 
    smlmitzrach : int
    shmmitzrach : str
    
    
class ListFood(FoodBase):
    model_config = ConfigDict(from_attributes=True)
    english_name : Optional[str] = None
    
    
    
    