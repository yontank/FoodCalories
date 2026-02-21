from pydantic import BaseModel

class Message(BaseModel):
    """
    The current class contains a base of how our HTTP errors would look like.
    since fastAPI doesn't know which HTTP errors a function throws, this is currently the only way.

    https://fastapi.tiangolo.com/advanced/additional-responses/#additional-response-with-model
    """
    message: str