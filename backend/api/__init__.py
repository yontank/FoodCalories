from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from . import api

app = FastAPI(title='monkey')
app.add_middleware(
    CORSMiddleware,
    allow_origins=['http://localhost:5173', 'localhost:5173'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*']
)
app.include_router(api.router, prefix='/v1')

@app.get('/')
def test():
    return 'monkey'