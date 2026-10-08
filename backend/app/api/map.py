from fastapi import APIRouter, Query
from typing import List, Dict, Any, Optional
from app.schemas.models import LocationGeoSummary
from app.services.dataset_service import LOCATIONS_REGISTRY, get_station_summary, resolve_location

router = APIRouter(prefix="/api/map", tags=["map"])

@router.get("/risk")
async def get_risk_map(location: Optional[str] = Query(default=None)):
    locations_list: List[LocationGeoSummary] = [
        get_station_summary(meta) for meta in LOCATIONS_REGISTRY.values()
    ]

    active_summary = None
    if location:
        active_meta = resolve_location(location)
        active_summary = get_station_summary(active_meta)

    return {
        "locations": locations_list,
        "activeLocation": active_summary,
    }
