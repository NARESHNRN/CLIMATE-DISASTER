from fastapi import APIRouter, Query, Body
from typing import List
from datetime import datetime
from app.schemas.models import AlertApiResponse
from app.services.dataset_service import resolve_location

router = APIRouter(prefix="/api/alerts", tags=["alerts"])

IN_MEMORY_ALERTS: List[AlertApiResponse] = [
    AlertApiResponse(
        id="ALT-2023-01",
        location="Mumbai",
        hazard="Flood",
        status="Warning",
        probability=82.0,
        message="Intense monsoonal precipitation pulse exceeding 75mm/24h. Inundation risk for low-lying coastal and Mithi riparian zones.",
        timestamp="2023-07-24T06:00:00Z",
        sourceType="AI Prediction",
        dataMode="demo",
        officialNoticeDisclaimer="Early Warning Advisory — Refer to Municipal Corporation of Greater Mumbai (MCGM) for mandatory operational directives.",
    ),
    AlertApiResponse(
        id="ALT-2023-02",
        location="Delhi",
        hazard="Flood",
        status="Warning",
        probability=76.0,
        message="Compounding upstream discharges on Yamuna River floodplain. Water level crest projected near danger mark.",
        timestamp="2023-07-11T08:30:00Z",
        sourceType="AI Prediction",
        dataMode="demo",
        officialNoticeDisclaimer="Hydrological Alert — Consult Central Water Commission (CWC) and Delhi Disaster Management Authority.",
    ),
    AlertApiResponse(
        id="ALT-2023-03",
        location="Bengaluru",
        hazard="Drought",
        status="Advisory",
        probability=64.0,
        message="30-day cumulative precipitation deficit with soil moisture dipping below 0.38. Soil dry-spell watch active.",
        timestamp="2023-07-18T10:00:00Z",
        sourceType="AI Prediction",
        dataMode="demo",
    ),
    AlertApiResponse(
        id="ALT-2023-04",
        location="Hyderabad",
        hazard="Heatwave",
        status="Watch",
        probability=58.0,
        message="Elevated diurnal surface temperatures approaching 39°C. Heat stress precautionary watch for outdoor laborers.",
        timestamp="2023-07-02T12:00:00Z",
        sourceType="AI Prediction",
        dataMode="demo",
    ),
    AlertApiResponse(
        id="ALT-2023-05",
        location="Chennai",
        hazard="Compound",
        status="Advisory",
        probability=48.0,
        message="Convective precipitation clusters combined with sea surface temperature anomalies. Nominal urban drainage monitoring recommended.",
        timestamp=datetime.utcnow().isoformat() + "Z",
        sourceType="AI Prediction",
        dataMode="demo",
    ),
]

@router.get("", response_model=List[AlertApiResponse])
async def get_alerts(location: str = Query(default=None)):
    if not location or location.lower() == "all":
        return IN_MEMORY_ALERTS
    meta = resolve_location(location)
    filtered = [a for a in IN_MEMORY_ALERTS if a.location.lower() == meta["name"].lower()]
    return filtered if filtered else [
        AlertApiResponse(
            id=f"ALT-NOMINAL-{meta['id']}",
            location=meta["name"],
            hazard="Compound",
            status="Normal",
            probability=15.0,
            message="No severe hazard thresholds currently breached. Environmental telemetry within baseline parameters.",
            timestamp=datetime.utcnow().isoformat() + "Z",
            sourceType="AI Prediction",
            dataMode="demo",
        )
    ]

@router.post("", response_model=AlertApiResponse)
async def create_alert(new_alert: AlertApiResponse):
    IN_MEMORY_ALERTS.insert(0, new_alert)
    return new_alert
