import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from . import api, login

app = FastAPI(title="monkey")

WEBSITE_URL = os.getenv("CORS_ORIGIN")

if not WEBSITE_URL:
    raise Exception("Env doesn't contain cors_origin")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[WEBSITE_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api.router, prefix="/api/v1")
app.include_router(login.router, prefix="/api/v1")


@app.get("/")
def test():
    return "monkey"

