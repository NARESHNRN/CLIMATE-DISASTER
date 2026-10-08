from fastapi import APIRouter, Query
from app.schemas.models import RiskApiResponse, RiskHazardItem
from app.services.dataset_service import resolve_location

router = APIRouter(prefix="/api/risk", tags=["risk"])

def compute_risk(loc_name: str) -> RiskApiResponse:
    meta = resolve_location(loc_name)
    loc_id = meta["id"]

    if loc_id == "Mumbai":
        score = 78.4
        f_score, d_score, h_score = 82.0, 18.0, 24.0
    elif loc_id == "Delhi":
        score = 74.2
        f_score, d_score, h_score = 76.5, 22.0, 38.0
    elif loc_id == "Bengaluru":
        score = 48.0
        f_score, d_score, h_score = 32.0, 64.0, 26.0
    elif loc_id == "Hyderabad":
        score = 45.0
        f_score, d_score, h_score = 30.0, 42.0, 68.0
    else:
        score = 42.5
        f_score, d_score, h_score = 38.0, 35.0, 41.0

    # Project-defined calibrated thresholds:
    # 0-20 Very Low, 21-40 Low, 41-60 Moderate, 61-80 High, 81-100 Very High
    if score >= 81:
        level = "Very High"
    elif score >= 61:
        level = "High"
    elif score >= 41:
        level = "Moderate"
    elif score >= 21:
        level = "Low"
    else:
        level = "Very Low"

    return RiskApiResponse(
        location=meta["name"],
        overallRiskScore=score,
        overallRiskLevel=level,
        risks={
            "flood": RiskHazardItem(score=f_score, probability=round(f_score / 100, 2), confidence="High"),
            "drought": RiskHazardItem(score=d_score, probability=round(d_score / 100, 2), confidence="Moderate"),
            "heatwave": RiskHazardItem(score=h_score, probability=round(h_score / 100, 2), confidence="Moderate"),
        },
        forecastWindow="0-7 Days",
        dataMode="demo",
        factors=[
            "Precipitation pulse intensity (1d/7d)",
            "Soil saturation pore pressure",
            "Niño 3.4 SST positive phase (+1.07°C)",
            "Drainage discharge topography index",
        ],
    )

@router.get("", response_model=RiskApiResponse)
async def get_risk_query(location: str = Query(default="Chennai")):
    return compute_risk(location)

@router.get("/{location}", response_model=RiskApiResponse)
async def get_risk_path(location: str):
    return compute_risk(location)
