from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers.chat import router as chat_router
from app.routers.debug import router as debug_router
from app.routers.doubts import router as doubts_router
from app.routers.health import router as health_router

app = FastAPI(title="Doubt-Threaded Chat API")
app.add_middleware(
	CORSMiddleware,
	allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
	allow_credentials=True,
	allow_methods=["*"],
	allow_headers=["*"],
)
app.include_router(health_router)
app.include_router(debug_router)
app.include_router(chat_router)
app.include_router(doubts_router)
