from fastapi import APIRouter, Query
from datetime import datetime
from app.schemas.models import PredictionsResponse, HazardPrediction, HazardFactor
from app.services.dataset_service import resolve_location

router = APIRouter(prefix="/api/predictions", tags=["predictions"])

@router.get("", response_model=PredictionsResponse)
async def get_predictions(location: str = Query(default="Chennai")):
    meta = resolve_location(location)
    loc_id = meta["id"]

    is_flood = loc_id in ["Mumbai", "Delhi", "Ahmedabad", "Patna", "Guwahati"]
    is_drought = loc_id in ["Bengaluru"]
    is_heat = loc_id in ["Hyderabad", "Bhopal"]

    flood_score = 82.5 if loc_id == "Mumbai" else 76.0 if loc_id == "Delhi" else 42.0
    drought_score = 68.0 if is_drought else 28.0
    heat_score = 71.0 if is_heat else 35.0

    composite = max(flood_score, drought_score, heat_score)
    composite_level = "High" if composite >= 61 else "Moderate" if composite >= 41 else "Low"

    hazards = [
        HazardPrediction(
            hazardType="flood",
            riskScore=flood_score,
            riskLevel="High" if flood_score >= 61 else "Moderate" if flood_score >= 41 else "Low",
            probabilityPercent=int(flood_score),
            confidencePercent=88,
            primaryDrivers=[
                HazardFactor(factor="7-Day Cumulative Precipitation", weight=0.42, observation="rainfall_7d > 160 mm"),
                HazardFactor(factor="Soil Moisture Saturation Index", weight=0.35, observation="soil_moisture > 0.48"),
                HazardFactor(factor="Niño 3.4 SST Teleconnection", weight=0.23, observation="nino34 anomaly +1.07°C"),
            ],
        ),
        HazardPrediction(
            hazardType="drought",
            riskScore=drought_score,
            riskLevel="High" if drought_score >= 61 else "Moderate" if drought_score >= 41 else "Low",
            probabilityPercent=int(drought_score),
            confidencePercent=82,
            primaryDrivers=[
                HazardFactor(factor="30-Day Deficit Precipitation", weight=0.45, observation="rainfall_30d < 165 mm"),
                HazardFactor(factor="Root-Zone Dryness Anomaly", weight=0.33, observation="soil_moisture < 0.40"),
                HazardFactor(factor="NDVI Vegetation Stress", weight=0.22, observation="ndvi = 0.43"),
            ],
        ),
        HazardPrediction(
            hazardType="heatwave",
            riskScore=heat_score,
            riskLevel="High" if heat_score >= 61 else "Moderate" if heat_score >= 41 else "Low",
            probabilityPercent=int(heat_score),
            confidencePercent=84,
            primaryDrivers=[
                HazardFactor(factor="Daily Max Temperature", weight=0.50, observation="temperature_max > 38.0°C"),
                HazardFactor(factor="Heat Index & Relative Humidity", weight=0.30, observation="apparent temp > 41°C"),
                HazardFactor(factor="Anticyclonic Stagnation", weight=0.20, observation="wind velocity < 8 km/h"),
            ],
        ),
    ]

    return PredictionsResponse(
        location=meta["name"],
        hazards=hazards,
        compositeRiskScore=round(composite, 1),
        compositeRiskLevel=composite_level,
        forecastWindow="Lead Time 24h - 7 Days",
        dataMode="demo",
        generatedAt=datetime.utcnow().isoformat() + "Z",
    )
