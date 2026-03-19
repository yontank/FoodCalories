from datetime import datetime

from fastapi import Request, APIRouter, status
from fastapi.responses import JSONResponse
from core.rate_limit import limiter
from api.v1 import meal_api, login, user_profile_api

router = APIRouter(prefix="/v1")


router.include_router(meal_api.router)
router.include_router(login.router)
router.include_router(user_profile_api.router)


@router.get("/")
@limiter.limit("1/minute")
def test(request: Request):
    return "Welcome to Israeli "


@router.get("/health", status_code=status.HTTP_200_OK)
@limiter.limit("30/minute")
async def health_check(request: Request):
    return JSONResponse(
        content={"status": "healthy", "timestamp": datetime.now().isoformat()}
    )
