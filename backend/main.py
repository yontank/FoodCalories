from fastapi.staticfiles import StaticFiles
import uvicorn

from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.exceptions import HTTPException

from core.config import settings
from core.rate_limit import limiter
from api.v1 import router

app = FastAPI(title="Israeli Food API")
# Rate Limiter using slow api, see SlowAPI documentation.
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded,_rate_limit_exceeded_handler) # type: ignore

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.CORS_ORIGIN],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(router=router.router, prefix='/api')

# Define a subclass of StaticFiles to create a custom static file handler
# that supports client-side routing in Single Page Applications (SPAs).
class SPAStaticFiles(StaticFiles):
    # Override the get_response method, which is responsible for retrieving
    # static file responses for given paths.
    async def get_response(self, path: str, scope):
        try:
            return await super().get_response(path, scope)
        except HTTPException as ex:
            if ex.status_code == 404:
                return await super().get_response("index.html", scope)
            else:
                raise ex

app.mount("/", SPAStaticFiles(directory="frontend", html=True), name="spa")

def main():
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)



if __name__ == '__main__':
    main()