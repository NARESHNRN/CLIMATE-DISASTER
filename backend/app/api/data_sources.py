from fastapi import APIRouter
from typing import List
from datetime import datetime
from app.schemas.models import DataSourceStatus

router = APIRouter(prefix="/api/data-sources", tags=["data-sources"])

@router.get("", response_model=List[DataSourceStatus])
async def get_data_sources():
    now_str = datetime.utcnow().strftime("%Y-%m-%d %H:%M UTC")
    return [
        DataSourceStatus(
            name="Open-Meteo Weather API",
            type="Numerical Weather Prediction (ECMWF & GFS)",
            status="Connected",
            lastUpdated=now_str,
            mode="Live",
        ),
        DataSourceStatus(
            name="Uploaded Disaster & Weather Observations",
            type="Station Observations & Reanalysis (310 Records)",
            status="Loaded",
            lastUpdated="2023-07-31",
            mode="Dataset",
        ),
        DataSourceStatus(
            name="NOAA Oceanic Niño Index (ONI)",
            type="3-Month Running Mean SST Anomalies (1950-2026)",
            status="Loaded",
            lastUpdated="2026-03",
            mode="Dataset",
        ),
        DataSourceStatus(
            name="NOAA ERSSTv5 Niño 3.4 SST Telemetry",
            type="Monthly Sea Surface Temperature Grid (1982-2026)",
            status="Loaded",
            lastUpdated="2026-03",
            mode="Dataset",
        ),
        DataSourceStatus(
            name="FastAPI & PyTorch ML Prediction Microservice",
            type="Asynchronous Service Pipeline",
            status="Connected",
            lastUpdated=now_str,
            mode="Live",
        ),
    ]
