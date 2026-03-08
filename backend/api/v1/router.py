from fastapi import Request, APIRouter
from core.rate_limit import limiter
from api.v1 import meal_api, login


router = APIRouter(prefix='/v1')



router.include_router(meal_api.router)
router.include_router(login.router)


@router.get("/")
@limiter.limit("1/minute")
def test(request: Request):
    return "monkey"
