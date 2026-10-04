from datetime import datetime, timezone
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.routers.games import router as games_router, ws_router as games_ws_router
from api.routers.generate import router as generate_router
from api.routers.analyze import analyze_router, validate_router
from api.routers.analytics import router as analytics_router, ws_analytics_router
from api.routers.admin import router as admin_router

app = FastAPI(
    title="A3T API",
    description="All Seeing Owl - Always A (Trivial) Triple Threat Full Integration API",
    version="1.0.0"
)

allowed_origins_str = os.getenv("ALLOWED_ORIGINS", "*")
allowed_origins = [origin.strip() for origin in allowed_origins_str.split(",")] if allowed_origins_str != "*" else ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(games_router)
app.include_router(games_ws_router)
app.include_router(generate_router)
app.include_router(analyze_router)
app.include_router(validate_router)
app.include_router(analytics_router)
app.include_router(ws_analytics_router)
app.include_router(admin_router)

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "version": "1.0.0",
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
