from fastapi import Request, APIRouter
from core.rate_limit import limiter
from . import api, login

router = APIRouter(prefix='/v1')



router.include_router(api.router)
router.include_router(login.router)


@router.get("/")
@limiter.limit("1/minute")
def test(request: Request):
    return "monkey"
