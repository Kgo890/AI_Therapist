import asyncio
import sys

# force rebuild for memory fix


if sys.platform.startswith("win"):
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.app.routes.therapist_routes import therapist_router
from backend.app.routes.auth_routes import auth_router

app = FastAPI(title="AI Therapist")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://data-structures-visualizer-r4qe.vercel.app",
        "http://localhost:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(therapist_router)


@app.get("/")
async def root():
    return {"message": "Your AI therapist is now running"}
