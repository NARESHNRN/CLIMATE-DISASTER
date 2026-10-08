"""
ClimaRisk AI - FastAPI Backend Server
El Niño Climate Disaster Prediction & Intelligent Early Warning System
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime

from app.api import (
    weather,
    predictions,
    risk,
    alerts,
    recommendations,
    simulation,
    model_comparison,
    lstm,
    map,
    timeline,
    vulnerability,
    enso,
    data_sources,
    hazards,
)

app = FastAPI(
    title="ClimaRisk AI API",
    description="Multi-hazard climate disaster prediction, ENSO telemetry, and early warning forecast API",
    version="2.4.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Configure CORS for local frontend dev servers
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount all endpoint routers
app.include_router(weather.router)
app.include_router(predictions.router)
app.include_router(risk.router)
app.include_router(alerts.router)
app.include_router(recommendations.router)
app.include_router(simulation.router)
app.include_router(model_comparison.router)
app.include_router(lstm.router)
app.include_router(map.router)
app.include_router(timeline.router)
app.include_router(vulnerability.router)
app.include_router(enso.router)
app.include_router(data_sources.router)
app.include_router(hazards.router)

@app.get("/")
@app.get("/health")
async def health_check():
    return {
        "status": "online",
        "service": "ClimaRisk AI FastAPI Backend",
        "version": "2.4.0",
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "datasetLoaded": "310 Station Records + 537 ENSO Records + 920 ONI Records",
    }
